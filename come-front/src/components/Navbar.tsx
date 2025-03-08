// src/components/Navbar.tsx

import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const Navbar: FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Forum
        </Typography>
        <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none' }}>
          Home
        </Button>
        <Button color="inherit" component={Link} to="/post" sx={{ textTransform: 'none' }}>
          Post
        </Button>
        <Button color="inherit" component={Link} to="/login" sx={{ textTransform: 'none' }}>
          Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;