// src/pages/ForgotPassword.tsx

import { Container, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Forgot Your Password? 😂
      </Typography>
      <Typography variant="h6" color="text.secondary" component="p">
        Haha, you silly goose! Did you really think we'd have a password recovery
        feature ready this soon? 🤡
      </Typography>
      <Typography variant="body1" component="p">
        Don't worry, we'll get to it eventually... maybe. For now, try to
        remember it, or just make a new account, you forgetful little genius! 😜
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/login"
        >
          Back to Login
        </Button>
      </Box>
    </Container>
  );
};

export default ForgotPassword;

