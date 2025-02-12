import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with your actual login logic
      const userData = {
        id: '1',
        username: 'testuser',
        email: email,
        role: email.includes('admin') ? ROLES.ADMIN : ROLES.USER,
        profilePictureUrl: null
      };
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    switch (permission) {
      case 'create_tournament':
      case 'create_post':
      case 'create_event':
      case 'manage_users':
        return user.role === ROLES.ADMIN;
      case 'update_profile':
      case 'delete_profile':
      case 'chat':
      case 'purchase':
        return true; // Both admin and regular users can do these
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 