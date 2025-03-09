// src/pages/Profile.tsx

import { getProfile, uploadAvatar } from "../api/user";
import { UserRole } from "../constants/roles";
import { ChangeEvent, useEffect, useState } from "react";
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

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  avatar: string;
  role: UserRole;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const avatarUrl = await uploadAvatar(file);
      setUser((prev) => prev ? {...prev, avatar: avatarUrl} : null);
      setError(null);
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload avatar");
      console.error(err);
    }
  };
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
              src={user.avatar || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: !user.avatar ? "primary.main" : undefined,
                mb: 2,
              }}
            >
              {!user.avatar && user.username[0].toUpperCase()}
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
            <input
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <Button variant="contained" component="span" sx={{ mr: 2 }}>
                Upload Avatar
              </Button>
            </label>
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
          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;

