import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Добавляем session token в заголовки, если нужно
    'Authorization': `Session ${getCookie('session_token') || ''}`
  }
});

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      // Перенаправляем на страницу входа при 403 ошибке
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Функция для получения куки
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default api;