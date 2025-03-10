// src/api/client.ts

import axios from 'axios';

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  username: string;
}

export interface LoginPayload {
  user_id: number;
  role: number;
  exp: number;
}

const auth_api = axios.create({
  baseURL: '/api/',
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (data: AuthPayload) => {
  const response = await auth_api.post('login', data);
  return response.data.data;
};

export const register = async (data: RegisterPayload) => {
  const response = await auth_api.post('register', data);
  return response.data;
};

