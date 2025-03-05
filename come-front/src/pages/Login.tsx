// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { login } from '../api/client';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSwitch = () => navigate('/register');
  const handleSubmit = async (data: {email: string; password: string}) => {
    setLoading(true);
    setError('');
    try {
      const response = await login(data);
      console.log('Login successful: ', response);
      navigate('/dashboard');
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
