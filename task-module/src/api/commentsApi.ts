import api from './axiosConfig';
import { Comment } from '../types/Task';

export const fetchComments = async (taskId: number): Promise<Comment[]> => {
  const response = await api.get(`/tasks/${taskId}/comments/`);
  return response.data;
};

export const addComment = async (taskId: number, text: string): Promise<Comment> => {
  const response = await api.post(`/tasks/${taskId}/comments/`, { text: text.trim() });
  return response.data;
};

export const updateComment = async (id: number, text: string): Promise<Comment> => {
  const response = await api.patch(`/comments/${id}/`, { text });
  return response.data;
};

export const deleteComment = async (commentId: number): Promise<void> => {
  await api.delete(`/comments/${commentId}/`);
};
