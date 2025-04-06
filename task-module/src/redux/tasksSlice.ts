// src/redux/tasksSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../types/Task';
import { fetchTasks, fetchTaskById } from '../api/tasks';

interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

export const loadTasks = createAsyncThunk('tasks/loadTasks', async () => {
  return await fetchTasks();
});

export const loadTaskById = createAsyncThunk('tasks/loadTaskById', async (id: number) => {
  return await fetchTaskById(id);
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Добавляем ручные редьюсеры для управления состоянием
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при загрузке задач';
      })
      .addCase(loadTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTaskById.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        state.loading = false;
      })
      .addCase(loadTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка при загрузке задачи';
      });
  },
});

// Экспортируем actions
export const { setTasks, clearTasks, setCurrentTask } = tasksSlice.actions;

export default tasksSlice.reducer;