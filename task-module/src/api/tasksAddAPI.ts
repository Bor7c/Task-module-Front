import api  from './axiosConfig';

interface TaskCreatePayload {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status?: 'Open' | 'In Progress' | 'Completed';
}

export const createTask = async (taskData: TaskCreatePayload) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
};
