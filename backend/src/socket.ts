import { Server, Socket } from 'socket.io';
import prisma from './config/prisma';
import logger from './utils/logger';
import { streamMessageSuggestion } from './services/openai.service';
import { randomUUID } from 'crypto';

export const socketHandler = (io: Server) => {
    // In-memory store for connected users: socketId -> { userId, userName, dbUserId }
    // userId for session (socketId), dbUserId for history (database)
    const connectedUsers = new Map<string, { userId: string; userName: string; dbUserId: string }>();

    io.on('connection', async (socket: Socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        socket.on('error', (err) => {
            logger.error(`Socket error for ${socket.id}: ${err}`);
        });

        // -------------------------
        // MANUAL LOGIN LOGIC
        // -------------------------
        socket.on('join_app', async (data: { userName: string }) => {
            try {
                const { userName } = data;
                if (!userName) {
                    socket.emit('error', 'Username is required');
                    return;
                }

                // 1. Find or create persistent user in DB
                let userRecord = await prisma.user.findFirst({ where: { name: userName } });

                if (!userRecord) {
                    userRecord = await prisma.user.create({
                        data: {
                            name: userName,
                        }
                    });
                }

                const dbUserId = userRecord.id;
                const socketUserId = socket.id;

                connectedUsers.set(socket.id, { userId: socketUserId, userName, dbUserId });
                socket.data.userId = socketUserId;
                socket.data.dbUserId = dbUserId;
                socket.data.userName = userName;

                // Broadcast updated user list
                const userList = Array.from(connectedUsers.values()).map(u => ({
                    id: u.dbUserId,
                    name: u.userName,
                    socketId: u.userId,
                    status: 'online'
                }));

                io.emit('update_user_list', userList);

                // Send back credentials
                socket.emit('user_registered', { userId: dbUserId, userName, socketId: socketUserId });

                logger.info(`User registered: ${userName} (DB: ${dbUserId})`);
                socket.join(dbUserId);

            } catch (error: any) {
                logger.error(`Error in join_app: ${error}`);
                const errorMessage = error instanceof Error ? error.message : String(error);

                socket.emit('error', 'Failed to join app: ' + errorMessage);
            }
        });


        // -------------------------
        // EVENT HANDLERS
        // -------------------------

        socket.on('join_room', async (roomId: string) => {
            try {
                if (!roomId) {
                    socket.emit('error', 'Room ID is required');
                    return;
                }

                await socket.join(roomId);
                logger.info(`User ${socket.data.userName || 'unknown'} joined room ${roomId}`);
                socket.emit('joined_room', roomId);
            } catch (error) {
                logger.error(`Error joining room: ${error}`);
                socket.emit('error', 'Failed to join room');
            }
        });

        socket.on('send_message', async (data: { chatRoomId: string; content: string }) => {
            try {
                const { chatRoomId, content } = data;
                const dbUserId = socket.data.dbUserId;
                const userName = socket.data.userName;

                if (!dbUserId || !userName) {
                    logger.warn(`Attempt to send message without auth: ${socket.id}`);
                    socket.emit('error', 'User not registered. Please reload.');
                    return;
                }

                if (!chatRoomId || !content) {
                    socket.emit('error', 'ChatRoomId and content are required');
                    return;
                }

                // 1. OPTIMISTIC EMIT
                const messageId = randomUUID();
                const createdAt = new Date();

                const optimisticMessage = {
                    id: messageId,
                    content,
                    chatRoomId,
                    userId: dbUserId,
                    createdAt: createdAt.toISOString(),
                    updatedAt: createdAt.toISOString(),
                    User: {
                        id: dbUserId,
                        name: userName
                    }
                };

                io.to(chatRoomId).emit('receive_message', optimisticMessage);
                logger.info(`Message emitted optimistically to ${chatRoomId}`);

                // 2. PERSISTENCE
                // Ensure room exists
                let chatRoom = await prisma.chatRoom.findFirst({ where: { name: chatRoomId } });
                if (!chatRoom) {
                    chatRoom = await prisma.chatRoom.create({ data: { name: chatRoomId } });
                }

                await prisma.message.create({
                    data: {
                        id: messageId,
                        content,
                        chatRoomId: chatRoom.id,
                        userId: dbUserId,
                        createdAt: createdAt,
                    }
                });

            } catch (error) {
                logger.error(`Error sending message: ${error}`);
                socket.emit('error', 'Failed to send message: ' + (error instanceof Error ? error.message : String(error)));
            }
        });

        socket.on('ai_assist', async (data: { prompt: string }) => {
            try {
                const { prompt } = data;
                logger.info(`AI Assist requested by ${socket.data.userName}`);

                await streamMessageSuggestion(
                    prompt,
                    (chunk) => socket.emit('ai_suggestion', chunk),
                    () => socket.emit('ai_complete'),
                    (err) => socket.emit('error', 'AI Generation Failed')
                );
            } catch (error) {
                logger.error(`AI Handler Error: ${error}`);
                socket.emit('error', 'AI Handler Failed');
            }
        });

        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            // Re-map for broadcast
            const userList = Array.from(connectedUsers.values()).map(u => ({
                id: u.dbUserId,
                name: u.userName,
                socketId: u.userId,
                status: 'online'
            }));
            io.emit('update_user_list', userList);
            logger.info(`User disconnected: ${socket.id}`);
        });
    });
};
