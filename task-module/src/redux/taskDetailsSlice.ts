// src/redux/taskDetailsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskAPI from '../api/taskDetailsAPI';  // Импортируем API функции
import { Task } from '../types/Task';

interface TaskDetailsState {
  task: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskDetailsState = {
  task: null,
  loading: false,
  error: null,
};

// Асинхронный экшен для загрузки одной задачи
export const loadTaskById = createAsyncThunk<Task, number>(
  'taskDetails/loadTaskById',
  async (id) => {
    const task = await taskAPI.fetchTaskById(id);
    return task;
  }
);

// Асинхронный экшен для обновления статуса задачи
export const updateTaskStatus = createAsyncThunk<Task, { id: number, status: string }>(
  'taskDetails/updateTaskStatus',
  async ({ id, status }) => {
    const updatedTask = await taskAPI.updateTaskStatus(id, status);
    return updatedTask;
  }
);

// Аналогичные экшены для других операций с одной задачей
export const updateTaskPriority = createAsyncThunk<Task, { id: number, priority: string }>(
  'taskDetails/updateTaskPriority',
  async ({ id, priority }) => {
    const updatedTask = await taskAPI.updateTaskPriority(id, priority);
    return updatedTask;
  }
);

const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
      })
      .addCase(loadTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload; // Обновляем только если ID совпадает
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Повторяем для других операций
  },
});

export default taskDetailsSlice.reducer;
