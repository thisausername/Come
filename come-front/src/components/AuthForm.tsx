// import { FC } from 'react';
// import { TextField, Button, Box, Typography } from '@mui/material';
// 
// interface AuthFormProps {
//   type: 'login' | 'register';
//   onSubmit: (email: string, password: string) => void;
//   error?: string;
// }
// 
// const AuthForm: FC<AuthFormProps> = ({ type, onSubmit, error }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
// 
//   return (
//     <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
//       <Typography variant="h4" align="center" gutterBottom>
//         {type === 'login' ? 'Login' : 'Register'}
//       </Typography>
//       <TextField
//         label="Email"
//         fullWidth
//         margin="normal"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />
//       <TextField
//         label="Password"
//         type="password"
//         fullWidth
//         margin="normal"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       {error && (
//         <Typography color="error" align="center" sx={{ mt: 2 }}>
//           {error}
//         </Typography>
//       )}
//       <Button
//         variant="contained"
//         fullWidth
//         sx={{ mt: 2 }}
//         onClick={() => onSubmit(email, password)}
//       >
//         {type === 'login' ? 'Login' : 'Register'}
//       </Button>
//     </Box>
//   );
// };
// 
// export default AuthForm;



import React, { useState } from 'react';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (email: string, password: string) => void;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (type === 'register' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {type === 'register' && (
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      )}
      {error && <div className="error">{error}</div>}
      <button type="submit">{type === 'login' ? 'Login' : 'Register'}</button>
    </form>
  );
};

export default AuthForm;

