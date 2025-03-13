// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRouter from './components/ProtectedRouter';
import Profile from './pages/Profile';
import Home from './pages/Home';
import { UserRole } from './constants/roles';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import ForgotPassword from './pages/ForgotPassword';
import Chat from './pages/Chat';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#7AB2D3',
      light: '#A3C9E2',
      dark: '#5589A4',
    },
    secondary: {
      main: '#B9E5E8',
    },
    background: {
      default: '#DFF2EB',
      paper: '#DFF2EB',
    },
    text: {
      primary: '#4A628A',
      secondary: '#4A628A',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/user/:id" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />

          <Route element={<ProtectedRouter />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/post" element={<CreatePost />} />
          </Route>

          <Route element={<ProtectedRouter requiredRole={UserRole.Admin} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
