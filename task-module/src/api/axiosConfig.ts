import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Функция для получения куки
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Интерцептор запроса
api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  const sessionId = localStorage.getItem('session_id');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }

  return config;
});

// Интерцептор ответа — редирект удалён
api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error); // Просто пробрасываем ошибку
  }
);

export default api;
