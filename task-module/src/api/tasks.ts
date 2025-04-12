import { Task, Comment } from '../types/Task';

const API_URL = 'http://localhost:8000/api';

// Общая функция для добавления заголовков
const getAuthHeaders = () => {
  const sessionId = localStorage.getItem('session_id');
  return {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId || '',
  };
};

// Функция для обработки ошибок авторизации
const handleAuthError = () => {
  localStorage.removeItem('session_id');
  window.location.href = '/login';
  throw new Error('Требуется авторизация');
};

// Функция для проверки ответа сервера
const checkResponse = async (response: Response, errorMessage: string) => {
  if (response.status === 401) {
    handleAuthError();
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorMessage);
  }
  
  return response;
};

// Задачи
export const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch(`${API_URL}/tasks/`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, 'Ошибка при загрузке задач');
  return response.json();
};

export const fetchTaskById = async (id: number): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, `Ошибка при загрузке задачи с ID ${id}`);
  return response.json();
};

export const createTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(taskData),
  });

  await checkResponse(response, 'Ошибка при создании задачи');
  return response.json();
};

// Комментарии
export const fetchComments = async (taskId: number): Promise<Comment[]> => {
  const response = await fetch(`${API_URL}/tasks/${taskId}/comments/`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, `Ошибка при загрузке комментариев для задачи ${taskId}`);
  return response.json();
};

export const addComment = async (taskId: number, text: string): Promise<Comment> => {
  // Логирование отправляемых данных
  console.log('Sending comment:', { taskId, text });
  
  const response = await fetch(`${API_URL}/tasks/${taskId}/comments/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ text: text.trim() }), // Очищаем текст перед отправкой
  });

  // Логирование статуса ответа
  console.log('Response status:', response.status);
  
  await checkResponse(response, 'Ошибка при добавлении комментария');
  
  const responseData = await response.json();
  // Логирование полученных данных
  console.log('Response data:', responseData);

  // Приводим данные к типу Comment
  const comment: Comment = {
    id: responseData.id,
    text: responseData.text,
    created_at: responseData.created_at,
    is_system: responseData.is_system || false,
    author: {
      id: responseData.author?.id || 0,
      username: responseData.author?.username || 'Unknown',
      ...(responseData.author?.role && { role: responseData.author.role })
    },
    ...(responseData.task && { task: responseData.task })
  };

  // Проверка обязательных полей
  if (!comment.text) {
    console.error('Received empty text in comment:', comment);
    throw new Error('Сервер вернул комментарий с пустым текстом');
  }

  return comment;
};


export const deleteComment = async (commentId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/comments/${commentId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, `Ошибка при удалении комментария ${commentId}`);
};

// Дополнительные методы для задач
export const updateTask = async (id: number, taskData: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(taskData),
  });

  await checkResponse(response, `Ошибка при обновлении задачи ${id}`);
  return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, `Ошибка при удалении задачи ${id}`);
};