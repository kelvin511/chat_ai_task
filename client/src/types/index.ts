export interface Message {
    id: number;
    content: string;
    chatRoomId: string;
    userId: string;
    createdAt?: string;
    User?: {
        name: string;
        email: string;
    }
}
