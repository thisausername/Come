// src/api/admin.ts

import apiClient from "./client";
import { User } from "./user";

export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get('/admin/users');
  return response.data.data;
};

export const banUser = async (userId: number, banned: boolean) => {
  const response = await apiClient.put(`/admin/users/${userId}/ban`, { banned });
  return response.data.data;
};

export const promoteToAdmin = async (userId: number) => {
  const response = await apiClient.put(`/admin/users/${userId}/promote`);
  return response.data.data;
};

export const deletePostAdmin = async (postId: number) => {
  const response = await apiClient.delete(`/admin/posts/${postId}`);
  return response.data.data;
};

export const deleteCommentAdmin = async (commentId: number) => {
  const response = await apiClient.delete(`/admin/comments/${commentId}`);
  return response.data.data;
};

export const getAdminDashboard = async (): Promise<{ users_count: number, posts_count: number, comments_count: number }> => {
  const response = await apiClient.get('/admin/dashboard');
  return response.data.data;
};

