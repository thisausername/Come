// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { login, LoginPayload } from '../api/auth';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/Navbar';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSwitch = () => navigate('/register');
  
  const handleSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      const token = await login(data);
      console.log('Login successful: ', token);

      const decoded = jwtDecode<LoginPayload>(token);
      localStorage.setItem('token', token);
      localStorage.setItem('role', decoded.role.toString());

      navigate("/");
    } catch (err: any) {
      setError('account not exist or wrong password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        {error && (
          <div
            className="error-message"
            style={{
              color: '#D32F2F',
              backgroundColor: '#FFEBEE',
              padding: '8px 12px',
              borderRadius: '4px',
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {error}
          </div>
        )}

        <AuthForm
          type="login"
          onSubmit={handleSubmit}
          onSwitch={handleSwitch}
          loading={loading}
          />
      </div>
    </>
  );
};

export default Login;
