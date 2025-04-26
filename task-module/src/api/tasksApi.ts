import api from './axiosConfig';
import { Task } from '../types/Task';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/');
  return response.data;
};

export const createTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}/`);
};
