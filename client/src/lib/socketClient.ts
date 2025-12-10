import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        // Replace with your actual backend URL
        const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';
        socket = io(url, {
            autoConnect: false, // We will connect manually when needed or in a provider
            transports: ['websocket'], // Prefer WebSocket
            withCredentials: true,
        });
    }
    return socket;
};
