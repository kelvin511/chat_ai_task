interface Message {
  id: number | string;
  senderId: number | string;
  senderName?: string;
  text: string;
  time: string;
  isMe: boolean;
}

interface MessageListProps {
  messages: Message[];
}

import { useEffect, useRef } from "react";

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-0">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}>
           {!msg.isMe && msg.senderName && (
               <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</span>
           )}
          <div
            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
              msg.isMe
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                : "bg-gray-800 text-gray-100 rounded-tl-sm"
            } shadow-md`}
          >
            <p>{msg.text}</p>
            <div
              className={`text-[10px] mt-1 text-right ${
                msg.isMe ? "text-blue-200" : "text-gray-400"
              }`}
            >
              {msg.time}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
