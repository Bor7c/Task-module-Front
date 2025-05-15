import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api/auth';
import type { User } from '../types/Types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  sessionChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  sessionChecked: false,
};

const adaptUser = (rawUser: any): User => ({
  id: rawUser.id,
  username: rawUser.username,
  email: rawUser.email,
  first_name: rawUser.first_name ?? '',
  last_name: rawUser.last_name ?? '',
  full_name: rawUser.full_name ?? '',
  middle_name: rawUser.middle_name ?? '',
  role: rawUser.role ?? 'developer',
  role_display: rawUser.role_display ?? '',
  is_active: rawUser.is_active ?? true,
  profile_picture_url: rawUser.profile_picture_url ?? null,
});

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      if (response.session_id) {
        localStorage.setItem('session_id', response.session_id);
      }
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.error || error.message || 'Ошибка регистрации';
      return rejectWithValue(message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.session_id) {
        localStorage.setItem('session_id', response.session_id);
      }
      return response;
    } catch (error: any) {
      const message = error?.response?.data?.error || error.message || 'Ошибка входа';
      return rejectWithValue(message);
    }
  }
);

export const checkUserSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const sessionId = localStorage.getItem('session_id');
      if (!sessionId) throw new Error('Сессия не найдена');

      const response = await authAPI.checkSession();
      if (!response) throw new Error('Недействительная сессия');
      return response;
    } catch (error: any) {
      localStorage.removeItem('session_id');
      return rejectWithValue(error.message || 'Ошибка проверки сессии');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('session_id');
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка выхода');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = adaptUser(action.payload.user);
        state.isAuthenticated = true;
        state.sessionChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.sessionChecked = true;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = adaptUser(action.payload.user); // Убедитесь что payload содержит user
        state.isAuthenticated = true;
        state.sessionChecked = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.sessionChecked = true;
      })

      .addCase(checkUserSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkUserSession.fulfilled, (state, action) => {
        state.loading = false;
        state.user = adaptUser(action.payload.user);
        state.isAuthenticated = true;
        state.sessionChecked = true;
      })
      .addCase(checkUserSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.sessionChecked = true;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, () => {
        return { ...initialState, sessionChecked: true };
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearAuthError, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
