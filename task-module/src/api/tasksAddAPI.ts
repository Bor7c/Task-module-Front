import api from './axiosConfig';
import { TaskPriority } from '../types/Types';

export interface TaskCreatePayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  team_id: number;
}

export const createTask = async (taskData: TaskCreatePayload) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};
