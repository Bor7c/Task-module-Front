import { Task } from '../types/Task';

const API_URL = 'http://localhost:8000/api'; // Убедитесь, что URL правильный

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks/`);
  if (!response.ok) {
    throw new Error('Ошибка при загрузке задач');
  }
  return response.json();
};

export const fetchTaskById = async (id: number): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`);
  if (!response.ok) {
    throw new Error('Ошибка при загрузке задачи');
  }
  return response.json();
};