import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Важно для работы с куками
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

// Интерсептор для добавления необходимых заголовков
api.interceptors.request.use(config => {
  // Добавляем CSRF токен для модифицирующих запросов
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  // Кука session_token будет отправляться автоматически благодаря withCredentials: true
  // Но если бэкенд требует X-Session-ID в заголовке, берем его из куки:
  const sessionToken = getCookie('session_token');
  if (sessionToken) {
    config.headers['X-Session-ID'] = sessionToken;
  }

  return config;
});

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      // Перенаправляем на страницу входа при ошибках аутентификации
      window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
    }
    return Promise.reject(error);
  }
);

export default api;