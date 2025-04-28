import api from './axiosConfig';
import { Task } from '../types/Types';

// Функция для получения задачи по ID
export const fetchTaskById = async (id: number): Promise<Task> => {
  const response = await api.get(`/tasks/${id}/`);
  return response.data;
};

// Функция для обновления статуса задачи
export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { status });
  return response.data;
};

// Функция для обновления приоритета задачи
export const updateTaskPriority = async (id: number, priority: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { priority });
  return response.data;
};

// Функция для назначения другого пользователя ответственным
export const updateTaskResponsible = async (id: number, userId: number): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign_responsible/`, { user_id: userId });
  return response.data;
};

// Функция для назначения себя ответственным
export const assignToMe = async (id: number): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/assign_to_me/`);
  return response.data;
};

// Функция для удаления ответственного
export const removeResponsible = async (id: number): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/remove_responsible/`);
  return response.data;
};

// Функция для обновления названия задачи
export const updateTaskTitle = async (id: number, title: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { title });
  return response.data;
};

// Функция для обновления описания задачи
export const updateTaskDescription = async (id: number, description: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/`, { description });
  return response.data;
};

// Функция для получения списка пользователей
export const fetchUsers = async (): Promise<any[]> => {
  const response = await api.get('/users/');
  return response.data;
};
