import api from './api';

export const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    if (access_token) {
      localStorage.setItem('taskflow_token', access_token);
      localStorage.setItem('taskflow_user', JSON.stringify(user));
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  },

  getStoredUser() {
    try {
      const stored = localStorage.getItem('taskflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('taskflow_token');
  }
};
