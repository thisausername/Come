// src/pages/Register.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { register } from '../api/client';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSwitch = () => navigate('/login');

  const handleSubmit = async (
    data: {
      username?: string;
      email: string;
      password: string;
      repeatPassword?: string
    }
  ) => {
    if (!data.username) {
      setError('Username missing');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      console.log('Registration successful: ', response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      type="register"
      onSubmit={handleSubmit}
      onSwitch={handleSwitch}
      loading={loading}
    />
  );
};

export default Register;
