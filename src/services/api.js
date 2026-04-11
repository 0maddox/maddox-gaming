import axios from 'axios';

const runtimeApiUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api/v1`
    : 'http://localhost:3000/api/v1';

const API_URL = process.env.REACT_APP_API_URL || runtimeApiUrl;

const api = axios.create({
  baseURL: API_URL,
});

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const fetchTournaments = async () => {
  const response = await api.get('/tournaments');
  return response.data;
};

export const fetchShopFeed = async () => {
  const response = await api.get('/shop_feed');
  return response.data;
};

export const createRegistration = async (data) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/registrations', data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const adminApi = {
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // This is important for Rails CSRF token
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  }
};

export default api;
