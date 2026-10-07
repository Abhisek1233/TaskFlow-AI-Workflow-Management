import api from './api';

export const aiService = {
  async analyzeTask(title, description = '') {
    const response = await api.post('/ai/analyze-task', {
      title,
      description
    });
    return response.data;
  }
};
