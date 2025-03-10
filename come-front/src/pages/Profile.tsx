// src/pages/Profile.tsx

import { getProfile, updateProfile, uploadAvatar } from "../api/user";
import { UserRole } from "../constants/roles";
import { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import { emailRegex } from "../constants/reg";

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
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setUsername(data.username);
      setEmail(data.email);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const avatarUrl = await uploadAvatar(file);
      setUser((prev) => prev ? { ...prev, avatar: avatarUrl } : null);
      setError(null);
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload avatar");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({username, email});
      setEditMode(false);
      await fetchProfile();
      setError(null);
    } catch (err: any) {
      setError(err.message?.data?.message || "Failed to update profile");
    }
  };

  if (!user) {
    return <Container sx={{ textAlign: "center", mt: 4 }}><Typography variant="h6">Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Tooltip title="Click to change avatar">
            <Avatar
              src={user.avatar}
              sx={{ 
                width: 80,
                height: 80,
                bgcolor: !user.avatar ? "primary.main" : undefined,
                mb: 2,
                cursor: "pointer",
                "&:hover": { border: "2px solid #1976d2" }
              }}
              onClick={handleAvatarClick}
              >
              {!user.avatar && user.username[0].toUpperCase()}
            </Avatar>
            </Tooltip>
            <input
              ref={fileInputRef}
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              User Profile
            </Typography>
          </Box>

          <Box sx={{ textAlign: "left" }}>
            {editMode ? (
              <>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                  error={!email || emailRegex.test(email)}
                  helperText={!email ? "Email is required" : emailRegex.test(email) ? "Invalid email format" : ""}
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={handleUpdateProfile} sx={{ mr: 2 }}>
                    Save
                  </Button>
                  <Button variant="outlined" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6" gutterBottom><strong>Username:</strong> {user.username}</Typography>
                <Typography variant="h6" gutterBottom><strong>Email:</strong> {user.email}</Typography>
                <Typography variant="h6" gutterBottom><strong>Role:</strong> {user.role === UserRole.Admin ? "Admin" : "User"}</Typography>
                <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
                  Edit Profile
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button variant="contained" color="primary" component={Link} to="/" sx={{ textTransform: "none" }}>
              Back to Home
            </Button>
          </Box>
          {error && <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>{error}</Typography>}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
