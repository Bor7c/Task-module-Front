import { Task } from '../types/Task';

const API_URL = 'http://localhost:8000/tasks/';

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Ошибка при загрузке задач');
  }
  return response.json();
};