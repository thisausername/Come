import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post('/login', data);
  return response.data;
};

export const register = async (data: { email: string; password: string }) => {
  const response = await api.post('/register', data);
  return response.data;
};


