import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskAPI from '../api/tasksApi';
import { Task } from '../types/Types';

interface TasksState {
  tasks: Task[];
  teamTasks: Task[];
  responsibleTasks: Task[];
  createdTasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  teamTasks: [],
  responsibleTasks: [],
  createdTasks: [],
  loading: false,
  error: null,
};

// --- Thunks ---
export const loadTasks = createAsyncThunk('tasks/loadTasks', async () => {
  return await taskAPI.fetchAllTasks();
});

export const loadTeamTasks = createAsyncThunk('tasks/loadTeamTasks', async () => {
  return await taskAPI.fetchTasks();
});

export const loadResponsibleTasks = createAsyncThunk<Task[]>(
  'tasks/loadResponsibleTasks',
  async () => {
    const tasks = await taskAPI.fetchResponsibleTasks();
    return tasks;
  }
);

export const loadCreatedTasks = createAsyncThunk('tasks/loadCreatedTasks', async () => {
  return await taskAPI.fetchCreatedTasks();
});

// --- Slice ---
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // --- All tasks ---
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
        state.error = action.error.message || 'Ошибка загрузки всех задач';
      })

      // --- Team tasks ---
      .addCase(loadTeamTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTeamTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload; // основной список задач
        state.teamTasks = action.payload; // можно сохранить отдельно, если нужно
      })
      .addCase(loadTeamTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки командных задач';
      })

      // --- Responsible tasks ---
      .addCase(loadResponsibleTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadResponsibleTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.responsibleTasks = action.payload;
      })
      .addCase(loadResponsibleTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка при загрузке задач';
      })

      // --- Created tasks ---
      .addCase(loadCreatedTasks.fulfilled, (state, action) => {
        state.createdTasks = action.payload;
      });
  },
});

export default tasksSlice.reducer;
