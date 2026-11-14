// src/services/api.js
// One Axios instance for all backend calls.
// The request interceptor automatically adds the JWT token.

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pawhaven_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Small helper so pages can show a friendly error message.
export function getErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'Something went wrong. Please try again.';
}

export default api;
