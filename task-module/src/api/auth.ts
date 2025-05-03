import api from './axiosConfig';
import { AxiosError } from 'axios';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: string;
  role_display?: string;
  is_staff?: boolean;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  profile_picture_url?: string | null;
}

interface AuthResponse {
  session_id?: string;
  user: UserData;
}

interface ErrorResponse {
  detail?: string;
  non_field_errors?: string[];
  error?: string;
  username?: string[];
  email?: string[];
  password?: string[];
}

// Храним ID интервала здесь
let sessionRefreshInterval: ReturnType<typeof setInterval> | null = null;

export const authAPI = {
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login/', credentials, {
        withCredentials: true,
      });

      const { session_id, user } = response.data;

      if (session_id) {
        localStorage.setItem('session_id', session_id);
      }

      authAPI.startSessionAutoRefresh();

      return { session_id, user };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message =
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.non_field_errors?.join(', ') ||
        axiosError.response?.data?.error ||
        'Login failed';

      throw new Error(message);
    }
  },

  async register(data: { username: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register/', data, {
        withCredentials: true,
      });

      const { session_id, user } = response.data;

      if (session_id) {
        localStorage.setItem('session_id', session_id);
      }

      authAPI.startSessionAutoRefresh();

      return { session_id, user };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;

      const errorMessages = [];

      if (axiosError.response?.data?.username) {
        errorMessages.push(`Username: ${axiosError.response.data.username.join(', ')}`);
      }
      if (axiosError.response?.data?.email) {
        errorMessages.push(`Email: ${axiosError.response.data.email.join(', ')}`);
      }
      if (axiosError.response?.data?.password) {
        errorMessages.push(`Password: ${axiosError.response.data.password.join(', ')}`);
      }

      const mainError =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.detail ||
        axiosError.response?.data?.non_field_errors?.join(', ');

      if (mainError) {
        errorMessages.unshift(mainError);
      }

      throw new Error(errorMessages.join('; ') || 'Registration failed');
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

      document.cookie = 'sessionid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      localStorage.removeItem('session_id');

      authAPI.stopSessionAutoRefresh();
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
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
      localStorage.removeItem('session_id');
      authAPI.stopSessionAutoRefresh();
      throw new Error('Session check failed');
    }
  },

  startSessionAutoRefresh(intervalMinutes = 5) {
    if (sessionRefreshInterval) {
      clearInterval(sessionRefreshInterval);
    }

    sessionRefreshInterval = setInterval(async () => {
      try {
        console.log('Refreshing session...');
        await authAPI.checkSession();
      } catch (error) {
        console.error('Session refresh failed:', error);
        authAPI.stopSessionAutoRefresh();
      }
    }, intervalMinutes * 60 * 1000);
  },

  stopSessionAutoRefresh() {
    if (sessionRefreshInterval) {
      clearInterval(sessionRefreshInterval);
      sessionRefreshInterval = null;
    }
  }
};
