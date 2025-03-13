// src/components/AuthForm.tsx

import { FC, useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Box,
} from '@mui/material';
import { emailRegex } from '../constants/reg';
import { Link as RouterLink } from 'react-router-dom';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (
    data: {
      username?: string;
      email: string;
      password: string;
      repeatPassword?: string;
    }
  ) => Promise<void>;
  onSwitch: () => void;
  loading?: boolean;
}

const AuthForm: FC<AuthFormProps> = ({ type, onSubmit, onSwitch, loading }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailRegex.test(email)) {
      setError('invalid email format 😢');
      return;
    }

    if (type === 'register' && password !== repeatPassword) {
      setError('passwords do not match 🤔');
      return;
    }
    try {
      if (type === 'register') {
        await onSubmit({ username, email, password, repeatPassword });
      } else {
        await onSubmit({ email, password });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'request failed');
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: 400,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Typography
          variant="h4"
          sx={{ textAlign: 'center', mb: 3, color: 'text.primary' }}
        >
          {type === 'login' ? '🎉 WelCome!' : '📝 Create Account'}
        </Typography>

        {type === 'register' && (
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {type === 'register' && (
          <TextField
            label="Repeat Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : type === 'login' ? (
            'Sign In'
          ) : (
            'Sign Up'
          )}
        </Button>

        <Typography sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
          {type === 'login' ? (
            <>
              New comer? <Link onClick={onSwitch}>Sign up</Link>
              <br />
              <Link component={RouterLink} to="/forgot-password">
                Forgot password? 😇
              </Link>
            </>
          ) : (
            <>
              Already have an account? <Link onClick={onSwitch}>Sign In</Link>
            </>
          )}
        </Typography>
      </form>
    </Box>
  );
};

export default AuthForm;

