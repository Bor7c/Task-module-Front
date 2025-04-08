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

export const authAPI = {
  login: async (credentials: { username: string; password: string }): Promise<{ user: UserData }> => {
    try {
      const response = await api.post('/auth/login/', credentials, {
        withCredentials: true,
      });
      
      // Возвращаем объект с user для совместимости со слайсом
      return {
        user: response.data.user
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(
        axiosError.response?.data?.detail || 
        axiosError.response?.data?.non_field_errors?.join(', ') || 
        'Login failed'
      );
    }
  },

  register: async (data: { username: string; email: string; password: string }): Promise<{ user: UserData }> => {
    try {
      const response = await api.post('/auth/register/', data, {
        withCredentials: true,
      });
      
      return {
        user: response.data.user
      };
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
      });
      
      document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  checkSession: async (): Promise<{ user: UserData } | null> => {
    try {
      const response = await api.get('/auth/session-check/', {
        withCredentials: true,
      });
      
      return {
        user: response.data.user
      };
    } catch (error) {
      return null;
    }
  }
};