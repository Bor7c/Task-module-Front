import api from './axiosConfig';
import { Task } from '../types/Types';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/my-team/');
  return response.data;
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks/');
  return response.data;
};


export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}/`);
};
