// src/pages/Profile.tsx

import { getProfile } from "../api/user";
import { UserRole } from "../constants/roles";
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

interface UserProfile {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getProfile()
      .then((data) => setUser(data))
      .catch((error) => console.error("Failed to load profile:", error));
  }, []);

  if (!user) {
    return (
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                mb: 2,
              }}
            >
              {user.username[0].toUpperCase()}
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              User Profile
            </Typography>
          </Box>

          <Box sx={{ textAlign: "left" }}>
            <Typography variant="h6" gutterBottom>
              <strong>Username:</strong> {user.username}
            </Typography>
            <Typography variant="h6" gutterBottom>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="h6" gutterBottom>
              <strong>Role:</strong> {user.role === UserRole.Admin ? "Admin" : "User"}
            </Typography>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/"
              sx={{ textTransform: "none" }}
            >
              Back to Home
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;

