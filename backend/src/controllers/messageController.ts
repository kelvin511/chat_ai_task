import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { roomId: roomName } = req.params;

        if (!roomName) {
            res.status(400).json({ message: 'Room Name is required' });
            return;
        }

        // The 'roomId' in the URL is actually the unique name (e.g., "user1-user2")
        const chatRoom = await prisma.chatRoom.findFirst({
            where: { name: roomName }
        });

        if (!chatRoom) {
            // Room doesn't exist yet, so no messages
            res.status(200).json([]);
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                chatRoomId: chatRoom.id
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};
