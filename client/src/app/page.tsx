"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useGetMessagesQuery, useSendMessageMutation } from "@/lib/features/chat/chatApi";
import { getSocket } from "@/lib/socketClient";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { Toaster, toast } from "sonner";

// Shared User interface for UI components
interface UIUser {
    id: string;
    name: string;
    avatar: string;
    status: string;
    lastMessage: string;
    time: string;
}

export default function ChatPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const [nameInput, setNameInput] = useState("");
    const [connectedUsers, setConnectedUsers] = useState<UIUser[]>([]);
    const [activeUser, setActiveUser] = useState<UIUser | null>(null);

    // State for input and AI
    const [inputText, setInputText] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Socket setup
    useEffect(() => {
        const socket = getSocket();
        
        if (!socket.connected) {
             socket.connect();
        }

        // Handle registration details from backend
        const onUserRegistered = (data: { userId: string; userName: string }) => {
            dispatch(setCredentials({ userId: data.userId, userName: data.userName }));
            toast.success(`Joined as ${data.userName}`);
        };

        const onUserList = (users: any[]) => {
            const uiUsers: UIUser[] = users
                .filter(u => u.socketId !== socket.id) 
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
                    status: "online",
                    lastMessage: "Click to chat",
                    time: "Now"
                }));
            setConnectedUsers(uiUsers);
        };

        const onConnectError = (err: any) => {
             console.error('Socket connection error:', err);
             toast.error("Connection failed. Check backend.");
        };

        const onError = (err: string) => {
            console.error('Socket error:', err);
            toast.error(err);
            setIsAiLoading(false); // Stop loading on error
        };

        const onReceiveMessage = (msg: any) => {
             // Only notify if message is NOT from me (using persistent User ID)
             // AND I am either not in a chat or chatting with someone else (logic could be refined but user requested "remove from current user")
             if (user && msg.userId !== user.userId && msg.chatRoomId) {
                  // Optional: Check if msg.chatRoomId === currentRoomId to suppress toast if looking at it?
                  // User just said "remove notification from current user".
                  // The previous check was `msg.userId !== socket.id`.
                  // If `msg.userId` matches my `user.userId`, it's me.
                  if (!activeUser || (activeUser && msg.userId !== activeUser.id)) { // Logic for "background" message
                       // This logic is a bit complex. Simple request: "remove notification from current user". 
                       // My own messages should never toast.
                       // The `msg.userId !== user.userId` handles that.
                       toast("New message", {
                            description: `${msg.User?.name || 'Someone'}: ${msg.content}`,
                       });
                  }
             }
        };

        // AI Listeners
        const onAiSuggestion = (chunk: string) => {
            setInputText(prev => prev + chunk);
        };

        const onAiComplete = () => {
            setIsAiLoading(false);
        };
        
        // Listeners
        socket.on('user_registered', onUserRegistered);
        socket.on('update_user_list', onUserList);
        socket.on('connect_error', onConnectError);
        socket.on('error', onError);
        socket.on('receive_message', onReceiveMessage);
        
        socket.on('ai_suggestion', onAiSuggestion);
        socket.on('ai_complete', onAiComplete);
        
        return () => {
            socket.off('user_registered', onUserRegistered);
            socket.off('update_user_list', onUserList);
            socket.off('connect_error', onConnectError);
            socket.off('error', onError);
            socket.off('receive_message', onReceiveMessage);
            
            socket.off('ai_suggestion', onAiSuggestion);
            socket.off('ai_complete', onAiComplete);
        };
    }, [dispatch, user, activeUser]); // added activeUser to deps for toast logic

    const handleJoin = (e: React.FormEvent) => {
      try {
        e.preventDefault();
        if (!nameInput.trim()) return;

        console.log("Attempting to join as:", nameInput);
        const socket = getSocket();

        const emitJoin = () => {
            console.log("Emitting join_app...");
            socket.emit('join_app', { userName: nameInput });
        };

        if (!socket.connected) {
            console.log("Socket not connected, connecting...");
            socket.connect();
            socket.once('connect', () => {
                console.log("Socket connected from handleJoin, emitting...");
                emitJoin();
            });
        } else {
            emitJoin();
        }
        
      } catch (error) {
        console.error("Join error:", error);
        toast.error("Failed to join");
      }
    };

    // Chat Logic
    const roomId = activeUser && user 
        ? [user.userId, activeUser.id].sort().join('-') 
        : 'global'; 

    // Ensure we join the room whenever it changes or we reconnect
    useEffect(() => {
        const socket = getSocket();
        if (connectedUsers.length > 0 && user && activeUser) {
             console.log("Joining room:", roomId);
             socket.emit('join_room', roomId);
        }
    }, [roomId, user, activeUser, connectedUsers.length]); // Re-run if these change

    const { data: rawMessages = [] } = useGetMessagesQuery(roomId, {
        skip: !user || !activeUser, 
    });
    
    const [sendMessage] = useSendMessageMutation();

    const currentMessages = rawMessages.map((msg: any) => ({
        id: msg.id || Date.now().toString(),
        senderId: msg.userId,
        senderName: msg.User?.name || 'Unknown',
        text: msg.content,
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Now",
        isMe: msg.userId === user?.userId,
    }));

    const handleSendMessage = (text: string) => {
        if (!user || !activeUser) return;
        sendMessage({ chatRoomId: roomId, content: text });
    };

    const handleAiAssist = () => {
        const socket = getSocket();
        if (!socket.connected) return;
        
        setIsAiLoading(true);
        // If input is empty, maybe send context? For now send prompt.
        // Prompt could be: "Write a message for me about..." or "Hello" -> "Hello! How are you?"
        // Ideally backend handles context. Here we just send current input as prompt.
        socket.emit('ai_assist', { prompt: inputText || "Help me write a friendly greeting" });
    };

    // If not authenticated yet, show Login Form
    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-100">
                <form onSubmit={handleJoin} className="bg-gray-900 p-8 rounded-xl border border-gray-800 space-y-4 w-96">
                    <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Join Chat</h1>
                    <input 
                        type="text" 
                        value={nameInput} 
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-gray-950 border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        Join
                    </button>
                    <p className="text-xs text-center text-gray-500">
                        Enter any name to create a session. Reload to restore history if name is simplified.
                    </p>
                </form>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
            <Sidebar 
                users={connectedUsers} 
                activeUser={activeUser || {} as UIUser} 
                setActiveUser={setActiveUser} 
            />

            <div className="flex-1 flex flex-col bg-gray-950 relative">
                <Toaster position="top-right" theme="dark" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
                </div>

                {activeUser ? (
                    <>
                        <ChatHeader activeUser={activeUser} />
                        <MessageList messages={currentMessages} />
                        <MessageInput 
                            value={inputText}
                            onChange={setInputText}
                            onSendMessage={() => {
                                handleSendMessage(inputText);
                                setInputText("");
                            }}
                            onAiAssist={handleAiAssist}
                            isAiLoading={isAiLoading}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
