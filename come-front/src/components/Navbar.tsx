// src/components/Navbar.tsx

import { AppBar, Toolbar, Typography, Button, Avatar, Tooltip } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile } from '../api/user';
import { UserProfile } from '../pages/Profile';


const Navbar: FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then((data) => setUser(data))
        .catch((error) => {
          console.error('Failed to fetch profile:', error);
          localStorage.removeItem('token');
          setUser(null)
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Button
          color="inherit"
          component={Link}
          to="/"
          sx={{ textTransform: 'none', mr: 2 }}
        >
          Home
        </Button>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Forum
        </Typography>
        <Button
          color="inherit"
          component={Link}
          to="/post"
          sx={{ textTransform: 'none', mr: 2 }}
        >
          Post
        </Button>
        {user ? (
          <Tooltip title={user.username}>
            <Avatar
              src={user.avatar}
              component={Link}
              to="/profile"
              sx={{
                bgcolor: !user.avatar ? 'primary.main' : undefined,
                width: 36,
                height: 36,
                textDecoration: 'none',
              }}
            >
              {!user.avatar && user.username[0].toUpperCase()}
            </Avatar>
          </Tooltip>
        ) : (
          <Button
            color="inherit"
            component={Link}
            to="/login"
            sx={{ textTransform: 'none' }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

