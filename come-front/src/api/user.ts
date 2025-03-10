// src/api/user.ts

import axios from "axios";
import { Post, Comment } from "./post"

const user_api = axios.create({
    baseURL: '/user/',
    headers: {'Content-Type': 'application/json'},
});

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const response = await user_api.get('/profile', {
    headers: { Authorization: token },
  });
  const profile = response.data.data;
  return profile;
};

export const updateProfile = async (updates: {username: string; email: string}) => {
  const token = localStorage.getItem("token");
  const response = await user_api.put('/profile', updates, {
    headers: { Authorization: token },
  });
  return response.data.data;
}

export const createPost = async (post: {title: string; content: string}): Promise<Post> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("No authentication token found");
  }
  const response = await user_api.post('post', post, {
    headers: { Authorization: token },
  });
  return response.data.data;
}

export const createComment = async (postId: number, content: string): Promise<Comment> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No authentication token found");
  const response = await user_api.post(`post/${postId}/comment`, { content }, {
    headers: { Authorization: token },
  });
  return response.data.data;
};

export const uploadAvatar = async (file: File): Promise<string> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error("No authentication token found");

  const formData = new FormData();
  formData.append('avatar', file);

  const response = await user_api.post('/avatar', formData, {
    headers: {
      Authorization: token,
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data.data;
}

