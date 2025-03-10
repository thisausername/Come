// src/api/post.ts

import apiClient from "./client";

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const getPostsPaginated = async (page: number, pageSize: number) => {
  const response = await apiClient.get(`/posts?page=${page}&pageSize=${pageSize}`);
  return response.data.data;
};

export const getPost = async (id: number): Promise<Post> => {
  const response = await apiClient.get(`/post/${id}`, {});
  return response.data.data;
}

export const createPost = async (post: {title: string; content: string}): Promise<Post> => {
  const response = await apiClient.post('/post', post)
  return response.data.data;
}

export const getPostComments = async (postId: number): Promise<Comment[]> => {
  const response = await apiClient.get(`/post/${postId}/comments`);
  return response.data.data || [];
};

export const createComment = async (postId: number, content: string): Promise<Comment> => {
  const response = await apiClient.post(`/post/${postId}/comment`, { content });
  return response.data.data;
};
