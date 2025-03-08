// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRouter from './components/ProtectedRouter';
import Profile from './pages/Profile';
import Home from './pages/Home';
import { UserRole } from './constants/roles';
import CreatePost from './components/CreatePost';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />

        <Route element={<ProtectedRouter />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/post" element={<CreatePost />} />
        </Route>

        <Route element={<ProtectedRouter requiredRole={UserRole.Admin} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
