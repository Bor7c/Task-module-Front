import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Task } from '../types/Task';
import { fetchTasks as fetchTasksApi } from '../api/tasks';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await fetchTasksApi();
  return response;
});

interface TasksState {
  tasks: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка при загрузке задач';
      });
  },
});

export default tasksSlice.reducer;