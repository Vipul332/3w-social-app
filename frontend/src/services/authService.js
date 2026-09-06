import apiClient from './apiClient';

export const signup = async ({ username, email, password }) => {
  const { data } = await apiClient.post('/auth/signup', { username, email, password });
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};
