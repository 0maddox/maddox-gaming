import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScrollProvider, useScroll } from './context/ScrollContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import PageBackground from './components/common/PageBackground';
import Footer from './components/Footer';
import Home from './components/Home';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Shop from './components/Shop';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Signup from './components/Signup';

function AppContent() {
  const { visible } = useScroll();

  return (
    <div className="min-h-screen d-flex flex-column">
      <PageBackground />
      <Navbar />
      <Sidebar />
      <main className={visible ? '' : 'navbar-hidden'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected User Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute requiredPermission="chat">
                <Chat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shop" 
            element={
              <ProtectedRoute requiredPermission="purchase">
                <Shop />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredPermission="manage_users">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ScrollProvider>
        <AppContent />
      </ScrollProvider>
    </AuthProvider>
  );
}

export default App;
