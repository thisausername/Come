// src/pages/Profile.tsx

import { getProfile } from "../api/user";
import { UserRole } from "../constants/roles";
import { useEffect, useState } from "react";

interface UserProfile {
    id: number;
    email: string;
    username: string;
    role: UserRole;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getProfile().then(
      (data) => setUser(data)
    ).catch(console.error);
  }, []);

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role === 1 ? "Admin" : "User"}</p>
    </div>
  );
};

export default Profile;
