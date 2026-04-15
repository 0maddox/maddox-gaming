import axios from 'axios';
import { API_URL } from '../config/env';

const MPESA_PAY_URL = API_URL.replace(/\/api\/v1\/?$/, '/api/mpesa/pay');

const api = axios.create({
  baseURL: API_URL,
});

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const fetchProductReviews = async (productId) => {
  const response = await api.get(`/products/${productId}/reviews`);
  return response.data;
};

export const createProductReview = async (productId, review) => {
  const token = localStorage.getItem('token');
  const response = await api.post(
    `/products/${productId}/reviews`,
    { review },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
};

export const fetchCart = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/cart', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const syncCart = async (items) => {
  const token = localStorage.getItem('token');
  const response = await api.put(
    '/cart',
    { items },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
};

export const createCheckout = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/checkouts', payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const createMpesaPayment = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(MPESA_PAY_URL, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const verifyCheckout = async (checkoutId, payload = {}) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/checkouts/${checkoutId}/verify`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchOrders = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/orders', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const retryOrderPayment = async (orderId, payload = {}) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/orders/${orderId}/retry`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchFinanceSummary = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/finance/summary', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchTournaments = async () => {
  const response = await api.get('/tournaments');
  return response.data;
};

export const fetchTournamentDetails = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}`);
  return response.data;
};

export const fetchTournamentMatches = async (tournamentId) => {
  const response = await api.get(`/tournaments/${tournamentId}/matches`);
  return response.data;
};

export const generateTournamentBracket = async (tournamentId) => {
  const token = localStorage.getItem('token');
  const response = await api.post(
    `/tournaments/${tournamentId}/generate_bracket`,
    {},
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return response.data;
};

export const simulateTournamentMatch = async (tournamentId) => {
  const token = localStorage.getItem('token');
  const response = await api.post(
    `/tournaments/${tournamentId}/simulate_match`,
    {},
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  return response.data;
};

export const createTournament = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/tournaments', { tournament: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const updateTournament = async (id, payload) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`/tournaments/${id}`, { tournament: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchCodmLeaderboard = async () => {
  const response = await api.get('/codm/leaderboard');
  return response.data;
};

export const createTeamProfile = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/team_profiles', { team_profile: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const createCodmPlayerStat = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/codm_player_stats', { codm_player_stat: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchPublicProfiles = async () => {
  const response = await api.get('/users/public_profiles');
  return response.data;
};

export const fetchMyProfile = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/users/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchFollows = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/follows', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const createFollow = async (followedId) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/follows', { followed_id: followedId }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const updateFollow = async (followId, status) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`/follows/${followId}`, { status }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchDiscussionThreads = async () => {
  const response = await api.get('/discussion_threads');
  return response.data;
};

export const fetchDiscussionThread = async (threadId) => {
  const response = await api.get(`/discussion_threads/${threadId}`);
  return response.data;
};

export const createDiscussionThread = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/discussion_threads', { discussion_thread: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const createDiscussionComment = async (threadId, body) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/discussion_threads/${threadId}/discussion_comments`, { discussion_comment: { body } }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchLftPosts = async () => {
  const response = await api.get('/lft_posts');
  return response.data;
};

export const createLftPost = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/lft_posts', { lft_post: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const updateLftPost = async (postId, payload) => {
  const token = localStorage.getItem('token');
  const response = await api.patch(`/lft_posts/${postId}`, { lft_post: payload }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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
