import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/client';
import AuthForm from '../components/AuthForm';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (email: string, password: string) => {
      console.log("Submit: email=" + email + " password=" + password);
  };

  return (
    <div className="auth-page">
      <AuthForm type="register" onSubmit={handleSubmit} error={error} />
    </div>
  );
};

export default Register;


