// src/api/post.ts

import apiClient from "./client";

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;

  isLiked: boolean;    
  isBookmarked: boolean;
  likesCount: number;
}

export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const likePost = async (postId: number, state: boolean): Promise<Post> => {
  const response = await apiClient.patch(`/post/${postId}/like`, { state });
  return response.data.data;
};

export const bookmarkPost = async (postId: number, state: boolean): Promise<Post> => {
  const response = await apiClient.patch(`/post/${postId}/bookmark`, { state });
  return response.data.data;
};

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

export const updatePost = async (id: number, updates: {title: string; content: string}): Promise<Post> => {
  const response = await apiClient.put(`/post/${id}`, updates);
  return response.data.data;
}

export const deletePost = async (id: number) => {
  const response = await apiClient.delete(`/post/${id}`);
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
