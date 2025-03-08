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

const post_api = axios.create({
  baseURL: 'api/',
  headers: { 'Content-Type': 'application/json' },
});

export const getPosts = async (): Promise<Post[]> => {
  const response = await post_api.get('posts/', {});
  return response.data.data;
};

export const createPost = async (post: {title: string; content: string}): Promise<Post> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await post_api.post('/', post, {
    headers: {Authorization: `${token}`},
  });
  return response.data.data;
}