// src/api/post.ts

import axios from 'axios';

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

const post_api = axios.create({
  baseURL: '/api/',
  headers: { 'Content-Type': 'application/json' },
});

export const getPosts = async (): Promise<Post[]> => {
  const response = await post_api.get('posts', {});
  return response.data.data;
};

export const getPost = async (id: number): Promise<Post> => {
  const response = await post_api.get(`post/${id}`, {});
  return response.data.data;
}

export const getPostComments = async (postId: number): Promise<Comment[]> => {
  const response = await post_api.get(`post/${postId}/comments`);
  return response.data.data || [];
};

