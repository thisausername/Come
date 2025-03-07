// src/pages/AdminDashboard.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await axios.get("/admin/users", {
      headers: { Authorization: localStorage.getItem("token") },
    });
    setUsers(response.data);
  };

  const handleDeleteUser = async (id: number) => {
    await axios.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: localStorage.getItem("token") },
    });
    fetchUsers();
  };

  return (
    <Container>
      <Typography variant="h4">Admin Dashboard</Typography>

      <Typography variant="h6">Users</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user: any) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role === 1 ? "Admin" : "User"}</TableCell>
              <TableCell>
                <Button onClick={() => handleDeleteUser(user.id)} color="error">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6">Messages</Typography>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
    </Container>
  );
};

export default AdminDashboard;

