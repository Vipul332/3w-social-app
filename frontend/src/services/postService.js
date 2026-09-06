import apiClient from './apiClient';

export const getFeed = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await apiClient.get('/posts', { params: { page, limit } });
  return data;
};

/**
 * Accepts { content, imageFile } and sends multipart/form-data so the
 * backend can accept an optional image alongside optional text.
 */
export const createPost = async ({ content, imageFile }) => {
  const formData = new FormData();
  if (content) formData.append('content', content);
  if (imageFile) formData.append('image', imageFile);

  const { data } = await apiClient.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const toggleLike = async (postId) => {
  const { data } = await apiClient.post(`/posts/${postId}/like`);
  return data;
};

export const addComment = async (postId, text) => {
  const { data } = await apiClient.post(`/posts/${postId}/comments`, { text });
  return data;
};
