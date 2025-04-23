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

export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  await checkResponse(response, `Ошибка при обновлении статуса задачи ${id}`);
  return response.json();
};

export const updateTaskDescription = async (id: number, description: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ description }),
  });

  await checkResponse(response, `Ошибка при обновлении описания задачи ${id}`);
  return response.json();
};


export const updateTaskPriority = async (id: number, priority: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ priority }),
  });

  await checkResponse(response, `Ошибка при обновлении приоритета задачи ${id}`);
  return response.json();
};

export const updateTaskResponsible = async (id: number, responsible_id: number | null): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ responsible: responsible_id }),
  });

  await checkResponse(response, `Ошибка при обновлении ответственного задачи ${id}`);
  return response.json();
};

export const updateTaskTitle = async (id: number, title: string): Promise<Task> => {
  const response = await fetch(`${API_URL}/tasks/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ title }),
  });

  await checkResponse(response, `Ошибка при обновлении названия задачи ${id}`);
  return response.json();
};

export const deleteTask = async (taskId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/tasks/${taskId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, `Ошибка при удалении задачи ${taskId}`);
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

export const updateComment = async (id: number, text: string): Promise<Comment> => {
  const response = await fetch(`${API_URL}/comments/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ text }),
  });

  await checkResponse(response, `Ошибка при обновлении комментария ${id}`);
  return response.json();
};


export const deleteComment = async (commentId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/comments/${commentId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  });

  await checkResponse(response, `Ошибка при удалении комментария ${commentId}`);
};

