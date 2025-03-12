// src/api/chat.ts

import apiClient from './client'

export interface ChatMessage {
    id: number;
    userId: number;
    username: string;
    content: string;
    createdAt: string;
}

export const getChatHistory = async (limit: number=50): Promise<ChatMessage[]> => {
    const response = await apiClient.get(`/chat/history?limit=${limit}`);
    return response.data.data;
}
