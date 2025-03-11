import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, banUser, promoteToAdmin, deletePostAdmin, deleteCommentAdmin, getAdminDashboard } from '../api/admin';
import { getPostsPaginated } from '../api/post';
import { User } from '../api/user';
import { Post } from '../api/post';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<{ users_count: number, posts_count: number, comments_count: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getAllUsers();
      const postsData = await getPostsPaginated(1, 10);
      const statsData = await getAdminDashboard();
      setUsers(usersData);
      setPosts(postsData.posts);
      setStats(statsData);
    };
    fetchData();
  }, []);

  const handleBan = async (userId: number, banned: boolean) => {
    await banUser(userId, !banned);
    setUsers(users.map(u => u.id === userId ? { ...u, banned: !banned } : u));
  };

  const handlePromote = async (userId: number) => {
    await promoteToAdmin(userId);
    setUsers(users.map(u => u.id === userId ? { ...u, role: 1 } : u));
  };

  const handleDeletePost = async (postId: number) => {
    await deletePostAdmin(postId);
    setPosts(posts.filter(p => p.id !== postId));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      
      {stats && (
        <Box sx={{ mb: 4 }}>
          <Typography>Users: {stats.users_count}</Typography>
          <Typography>Posts: {stats.posts_count}</Typography>
          <Typography>Comments: {stats.comments_count}</Typography>
        </Box>
      )}

      <Typography variant="h6">Users</Typography>
      <List>
        {users.map(user => (
          <ListItem key={user.id}>
            <ListItemText primary={`${user.username} (${user.email}) - ${user.role === 1 ? 'Admin' : 'User'}`} />
            <Button onClick={() => handleBan(user.id, user.banned)} sx={{ mr: 1 }}>
              {user.banned ? 'Unban' : 'Ban'}
            </Button>
            {user.role !== 1 && <Button onClick={() => handlePromote(user.id)}>Promote to Admin</Button>}
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 2 }}>Posts</Typography>
      <List>
        {posts.map(post => (
          <ListItem key={post.id}>
            <ListItemText primary={post.title} secondary={`Author: ${post.authorId}`} />
            <Button color="error" onClick={() => handleDeletePost(post.id)}>Delete</Button>
          </ListItem>
        ))}
      </List>

      <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>Back to Home</Button>
    </Container>
  );
};

export default AdminDashboard;
