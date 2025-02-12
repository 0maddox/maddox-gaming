import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1', // Backend API URL
});

export const fetchProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const fetchTournaments = async () => {
  const response = await api.get('/tournaments');
  return response.data;
};

export const createRegistration = async (data) => {
  const response = await api.post('/registrations', data);
  return response.data;
};

export default api;
