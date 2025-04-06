import api from './axiosConfig';
import { AxiosError } from 'axios';

interface AuthResponse {
  session_id: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login/', { username, password }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': getCookie('csrftoken') || '', // Добавляем CSRF защиту
    }
  });
  return response.data;
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register/', {
    username,
    email,
    password
  }, {
    withCredentials: true,
    headers: {
      'X-CSRFToken': getCookie('csrftoken') || '',
    }
  });
  return response.data;
};

export const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout/');
      
      // Очистка всех аутентификационных данных
      document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'csrftoken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Logout failed:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers
      });
      throw error;
    }
  };

export const checkSession = async (): Promise<AuthResponse | null> => {
  try {
    const response = await api.get('/auth/session-check/', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Session check failed:', error);
    clearAuthData(); // Очищаем данные при неудачной проверке сессии
    return null;
  }
};

// Вспомогательные функции
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function clearAuthData(): void {
  // Очищаем куки
  document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'csrftoken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  
  // Очищаем localStorage (если использовали)
  localStorage.removeItem('session_token');
  localStorage.removeItem('user_data');
  
  // Очищаем sessionStorage
  sessionStorage.clear();
}