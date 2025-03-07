// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRouter from './components/ProtectedRouter';
import Profile from './pages/Profile';
import { UserRole } from './constants/roles';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRouter />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRouter requiredRole={UserRole.Admin} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
