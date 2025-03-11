// src/pages/Profile.tsx

import { getProfile, getUser, updateProfile, uploadAvatar, User } from "../api/user";
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
import { Link, useParams } from "react-router-dom";
import { emailRegex } from "../constants/reg";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("token");
  const currentUserId = token ? (jwtDecode<{ user_id: number }>(token).user_id) : null;
  const isOwnProfile = userId ? parseInt(userId) === currentUserId : true;
  console.log("isOwnProfile: ", isOwnProfile);
  const fetchProfile = async () => {
    try {
      let data: User;
      if (userId) {
        data = await getUser(parseInt(userId));
      } else {
        data = await getProfile();
      }
      setUser(data);
      setUsername(data.username);
      setEmail(data.email);
    } catch (error) {
      setError("Failed to laod profile")
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isOwnProfile) return;
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
    if (!isOwnProfile) return;
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
            <Tooltip title="click to change avatar">
            <Avatar
              src={user.avatar}
              sx={{ 
                width: 80,
                height: 80,
                bgcolor: !user.avatar ? "primary.main" : undefined,
                mb: 2,
                cursor: isOwnProfile ? "pointer" : "default",
                "&:hover": isOwnProfile ? { border: "2px solid #1976d2" } : {},
              }}
              onClick={isOwnProfile ? handleAvatarClick : undefined}
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
              {isOwnProfile ? "Profile" : `${user.username}'s Profile`}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "left" }}>
            {editMode && isOwnProfile ? (
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
                  error={!email || !emailRegex.test(email)}
                  helperText={!email ? "Email is required" : !emailRegex.test(email) ? "Invalid email format" : ""}
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
                <Typography variant="h6" gutterBottom>
                  <strong>Username:</strong> {user.username}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  <strong>Role:</strong> {user.role === UserRole.Admin ? "Admin" : "User"}
                </Typography>
                {isOwnProfile && (
                  <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
                    Edit
                  </Button>
                )}
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
