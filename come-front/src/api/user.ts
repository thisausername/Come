// src/api/user.ts

import apiClient from "./client";

export interface User {
  username: string;
  email: string;
  avatar: string;
}

export const getProfile = async () => {
  const response = await apiClient.get('/profile');
  return response.data.data;
};

export const updateProfile = async (updates: {username: string; email: string}) => {
  const response = await apiClient.put('/profile', updates)
  return response.data.data;
}

export const uploadAvatar = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await apiClient.post('/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
}

export const getUsersBatch = async (ids: number[]) => {
  const response = await apiClient.get(`/users/batch?ids=${ids.join(',')}`);
  return response.data.data;
};

