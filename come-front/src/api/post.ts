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
  baseURL: '/api/',
  headers: { 'Content-Type': 'application/json' },
});

export const getPosts = async (): Promise<Post[]> => {
  const response = await post_api.get('posts', {});
  return response.data.data;
};

export const getPost = async (id: number): Promise<Post> => {
  console.log("url = ", post_api.getUri() + `post/${id}`)
  const response = await post_api.get(`post/${id}`, {});
  return response.data.data;
}