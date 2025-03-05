import axios from 'axios';

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  username: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const login = async (data: AuthPayload) => {
  const response = await api.post('/login', data);
  return response.data;
};

export const register = async (data: RegisterPayload) => {
  const response = await api.post('/register', data);
  return response.data;
};


