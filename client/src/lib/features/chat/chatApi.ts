import { apiSlice } from '../api/apiSlice';
import { getSocket } from '../../socketClient';
import { Message } from '@/types'; // usage assumption, will define later or use any

export const chatApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Query to fetch initial history from REST API
        getMessages: builder.query<any[], string>({
            query: (roomId) => `chat/${roomId}/messages`,
            async onCacheEntryAdded(
                roomId,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                const socket = getSocket();

                try {
                    await cacheDataLoaded;

                    socket.emit('join_room', roomId);

                    const listener = (message: any) => {
                        updateCachedData((draft) => {
                            if (!draft.find((m: any) => m.id === message.id)) {
                                draft.push(message);
                            }
                        });
                    };

                    socket.on('receive_message', listener);

                    // Cleanup
                    await cacheEntryRemoved;
                    socket.off('receive_message', listener);
                } catch {
                    // no-op
                }
            },
        }),
        sendMessage: builder.mutation<null, { chatRoomId: string; content: string }>({
            queryFn: ({ chatRoomId, content }) => {
                const socket = getSocket();
                return new Promise((resolve) => {
                    if (!socket.connected) {
                        resolve({ error: { status: 503, statusText: 'Service Unavailable', data: 'Socket not connected' } } as any);
                        return;
                    }
                    socket.emit('send_message', { chatRoomId, content });
                    resolve({ data: null });
                });
            },
        }),
    }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = chatApi;
