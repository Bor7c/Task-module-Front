import api from './axiosConfig';

interface TaskCreatePayload {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high'  | 'critical';
}

export const createTask = async (taskData: TaskCreatePayload) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};
