import api from './axiosConfig';
import { Task } from '../types/Task';

export const fetchTaskById = async (id: number): Promise<Task> => {
  const response = await api.get(`/tasks/${id}/`);
  return response.data;
};

export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { status });
  return response.data;
};

export const updateTaskPriority = async (id: number, priority: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { priority });
  return response.data;
};

export const updateTaskResponsible = async (id: number, responsible_id: number | null): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { responsible: responsible_id });
  return response.data;
};

export const updateTaskTitle = async (id: number, title: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { title });
  return response.data;
};

export const updateTaskDescription = async (id: number, description: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { description });
  return response.data;
};
