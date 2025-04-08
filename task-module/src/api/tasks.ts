import { Task } from '../types/Task';

const API_URL = 'http://localhost:8000/api';

// Общая функция для добавления заголовков
const getAuthHeaders = () => {
  const sessionId = localStorage.getItem('session_id');
  return {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId || '',
  };
};

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks/`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include', // Важно для отправки кук
  });

  if (response.status === 401) {
    // Сессия истекла или невалидна
    localStorage.removeItem('session_id');
    window.location.href = '/login'; // Перенаправляем на страницу входа
    throw new Error('Требуется авторизация');
  }

  if (!response.ok) {
    throw new Error('Ошибка при загрузке задач');
  }

  return response.json();
};

export const fetchTaskById = async (id: number): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include', // Важно для отправки кук
  });

  if (response.status === 401) {
    localStorage.removeItem('session_id');
    window.location.href = '/login';
    throw new Error('Требуется авторизация');
  }

  if (!response.ok) {
    throw new Error(`Ошибка при загрузке задачи с ID ${id}`);
  }

  return response.json();
};

// Пример функции для создания задачи
export const createTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    throw new Error('Ошибка при создании задачи');
  }

  return response.json();
};