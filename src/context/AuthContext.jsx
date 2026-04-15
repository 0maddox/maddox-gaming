import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'token';
const USER_KEY = 'auth_user';

export const ROLES = {
  USER: 'user',
  SUPPORT_AGENT: 'support_agent',
  COMMUNITY_MODERATOR: 'community_moderator',
  TOURNAMENT_MANAGER: 'tournament_manager',
  CATALOG_MANAGER: 'catalog_manager',
  CONTENT_ADMIN: 'content_admin',
  MARKETING_MANAGER: 'marketing_manager',
  ANALYTICS_VIEWER: 'analytics_viewer',
  FINANCE_ADMIN: 'finance_admin',
  SUPER_ADMIN: 'super_admin'
};

const PERMISSIONS = {
  access_admin: [
    ROLES.SUPPORT_AGENT,
    ROLES.COMMUNITY_MODERATOR,
    ROLES.TOURNAMENT_MANAGER,
    ROLES.CATALOG_MANAGER,
    ROLES.CONTENT_ADMIN,
    ROLES.MARKETING_MANAGER,
    ROLES.ANALYTICS_VIEWER,
    ROLES.FINANCE_ADMIN,
    ROLES.SUPER_ADMIN,
  ],
  create_tournament: [ROLES.TOURNAMENT_MANAGER, ROLES.SUPER_ADMIN],
  manage_tournaments: [ROLES.TOURNAMENT_MANAGER, ROLES.SUPER_ADMIN],
  manage_products: [ROLES.CATALOG_MANAGER, ROLES.SUPER_ADMIN],
  manage_content: [ROLES.CONTENT_ADMIN, ROLES.MARKETING_MANAGER, ROLES.SUPER_ADMIN],
  manage_users: [ROLES.COMMUNITY_MODERATOR, ROLES.SUPPORT_AGENT, ROLES.SUPER_ADMIN],
  view_analytics: [ROLES.ANALYTICS_VIEWER, ROLES.FINANCE_ADMIN, ROLES.MARKETING_MANAGER, ROLES.SUPER_ADMIN],
  manage_finance: [ROLES.FINANCE_ADMIN, ROLES.SUPER_ADMIN],
  assign_roles: [ROLES.SUPER_ADMIN],
  update_profile: Object.values(ROLES),
  delete_profile: Object.values(ROLES),
  chat: Object.values(ROLES),
  purchase: Object.values(ROLES),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) {
      setAuthReady(true);
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setAuthReady(true);
    }
  }, []);

  const normalizeUser = (rawUser, fallbackEmail = '') => ({
    id: rawUser?.id,
    username: rawUser?.username || rawUser?.name || 'user',
    email: rawUser?.email || fallbackEmail,
    phoneNumber: rawUser?.phone_number || rawUser?.phoneNumber || '',
    role: rawUser?.role || (rawUser?.admin ? ROLES.SUPER_ADMIN : ROLES.USER),
    admin: Boolean(rawUser?.admin),
    profilePictureUrl: rawUser?.profile_picture_url || null,
  });

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.token || !data?.user) {
        return {
          success: false,
          error: data?.error || 'Invalid email or password',
        };
      }

      const normalizedUser = normalizeUser(data.user, email);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Unable to reach server. Try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;

    const allowedRoles = PERMISSIONS[permission] || [];
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 