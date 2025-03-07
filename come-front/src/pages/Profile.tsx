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

  console.log("Profile: ", user);
  useEffect(() => {
    console.log("Calling getProfile...");
    getProfile().then(
      (data) => {
        setUser(data);
      }
    ).catch(console.error);
  }, []);

  console.log(user)
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
