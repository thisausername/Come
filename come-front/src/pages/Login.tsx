// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { login, LoginPayload } from '../api/auth';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSwitch = () => navigate('/register');
  const handleSubmit = async (data: {email: string; password: string}) => {
    setLoading(true);
    setError('');
    try {
      const token = await login(data);
      console.log('Login successful: ', token);
      const decoded = jwtDecode<LoginPayload>(token);
      localStorage.setItem("token", token);
      localStorage.setItem("role", decoded.role.toString()); 
      navigate('/profile');
    } catch(err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="login"
      onSubmit={handleSubmit}
      onSwitch={handleSwitch}
      loading={loading}
    />
  );
};

export default Login;
