import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/client';
import AuthForm from '../components/AuthForm';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (email: string, password: string) => {
      console.log("Submit: email=" + email + " Password=" + password);
  };

  return (
    <div className="auth-page">
      <AuthForm type="login" onSubmit={handleSubmit} error={error} />
    </div>
  );
};

export default Login;


