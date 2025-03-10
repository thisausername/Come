// src/components/Navbar.tsx

import { AppBar, Toolbar, Typography, Button, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../api/user';
import { UserProfile } from '../pages/Profile';

const Navbar: FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUser()
        .then((data) => {
          setUser(data);
        })
        .catch((_) => {
          localStorage.removeItem('token');
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    handleMenuClose();
    window.location.href = '/login';
  };

  const avatarSrc = user?.avatar ? `/${user.avatar}` : undefined;

  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none', mr: 2 }}>
          Home
        </Button>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Forum
        </Typography>
        <Button color="inherit" component={Link} to="/post" sx={{ textTransform: 'none', mr: 2 }}>
          Post
        </Button>
        {user ? (
          <>
            <Tooltip title={user.username}>
              <Avatar
                src={avatarSrc}
                sx={{
                  bgcolor: !user.avatar ? 'primary.main' : undefined,
                  width: 36,
                  height: 36,
                  cursor: 'pointer',
                  "&:hover": { border: "2px solid #1976d2" },
                }}
                onClick={handleAvatarClick}
              >
                {!user.avatar && user.username[0].toUpperCase()}
              </Avatar>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                '& .MuiPaper-root': {
                  minWidth: 150,
                  bgcolor: '#ffffff',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login" sx={{ textTransform: 'none' }}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
