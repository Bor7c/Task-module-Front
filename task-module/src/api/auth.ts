import api from './axiosConfig';
import { AxiosError } from 'axios';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthResponse {
  session_id: string;
  user: UserData;
}

interface ErrorResponse {
  detail?: string;
  non_field_errors?: string[];
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const clearAuthData = (): void => {
  // Очистка кук
  const cookies = ['sessionid', 'csrftoken', 'session_id'];
  cookies.forEach(cookie => {
    document.cookie = `${cookie}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });

  // Очистка хранилищ
  ['session_token', 'user_data'].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const authAPI = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login/', credentials, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
        }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.detail || 
        axiosError.response?.data?.non_field_errors?.join(', ') || 
        'Login failed'
      );
    }
  },

  register: async (data: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register/', data, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
        }
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.detail || 
        axiosError.response?.data?.non_field_errors?.join(', ') || 
        'Registration failed'
      );
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout/', {}, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || '',
        }
      });
      clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      clearAuthData(); // Все равно очищаем данные даже при ошибке
      throw error;
    }
  },

  checkSession: async (): Promise<AuthResponse | null> => {
    try {
      const response = await api.get('/auth/session-check/', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      clearAuthData();
      return null;
    }
  }
};