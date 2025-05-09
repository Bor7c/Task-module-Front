// src/redux/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchUsers, fetchUserDetails, updateUserInfo } from '../api/usersApi';
import { User } from '../types/Types';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// ✅ Получение всех пользователей
export const getAllUsers = createAsyncThunk('users/getAll', async (_, { rejectWithValue }) => {
  try {
    const data = await fetchUsers();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Ошибка при загрузке пользователей');
  }
});

// ✅ Получение деталей пользователя
export const getUserDetails = createAsyncThunk(
  'users/getDetails',
  async (userId: number, { rejectWithValue }) => {
    try {
      const user = await fetchUserDetails(userId);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при получении пользователя');
    }
  }
);

// ✅ Обновление информации пользователя
export const patchUserInfo = createAsyncThunk(
  'users/updateInfo',
  async ({ userId, data }: { userId: number; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const updated = await updateUserInfo(userId, data);
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при обновлении пользователя');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User> & { id: number }>) => {
      const index = state.users.findIndex((user) => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = {
          ...state.users[index],
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllUsers
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(getAllUsers.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })

      // getUserDetails
      .addCase(getUserDetails.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index === -1) {
          state.users.push(action.payload);
        } else {
          state.users[index] = action.payload;
        }
      })

      // patchUserInfo
      .addCase(patchUserInfo.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export const { setUsers, setLoading, setError, updateUser } = usersSlice.actions;
export default usersSlice.reducer;
