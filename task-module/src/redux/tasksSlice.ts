// src/redux/tasksSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskAPI from '../api/tasksApi';  // Импортируем наши API функции
import { Task } from '../types/Types';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Асинхронный экшен для загрузки задач с использованием axios API
export const loadTasks = createAsyncThunk<Task[]>(
  'tasks/loadTasks',
  async () => {
    // Используем API для загрузки задач
    const tasks = await taskAPI.fetchTasks();
    return tasks;
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      });
  },
});

export default tasksSlice.reducer;
