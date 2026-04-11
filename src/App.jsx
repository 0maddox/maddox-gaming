import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Shop from './components/Shop';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/shop" element={<Shop />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredPermission="access_admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
