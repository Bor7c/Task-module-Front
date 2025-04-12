import api from './axiosConfig';
import { AxiosError } from 'axios';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  role_display?: string;
  is_staff?: boolean;
}

interface AuthResponse {
  session_id?: string;
  user: UserData;
}

interface ErrorResponse {
  detail?: string;
  non_field_errors?: string[];
}

export const authAPI = {
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login/', credentials, {
        withCredentials: true,
      });
      
      return {
        session_id: response.data.session_id,
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

  async register(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register/', data, {
        withCredentials: true,
      });
      
      return {
        session_id: response.data.session_id,
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

  async logout(): Promise<void> {
    try {
      const sessionId = localStorage.getItem('session_id');
      await api.post('/auth/logout/', {}, {
        headers: {
          'X-Session-ID': sessionId || '',
        },
        withCredentials: true,
      });
      
      // Очищаем как куки, так и localStorage
      document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.removeItem('session_id');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  async checkSession(): Promise<AuthResponse> {
    try {
      const sessionId = localStorage.getItem('session_id');
      const response = await api.get('/auth/session-check/', {
        headers: {
          'X-Session-ID': sessionId || '',
        },
        withCredentials: true,
      });
      
      return {
        user: response.data
      };
    } catch (error) {
      throw new Error('Session check failed');
    }
  }
};