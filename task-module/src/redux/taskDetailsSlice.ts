import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskAPI from '../api/taskDetailsAPI';  // Импортируем API функции
import { Task, User } from '../types/Types';

interface TaskDetailsState {
  task: Task | null;
  users: User[];  // Добавим список пользователей для назначения ответственного
  loading: boolean;
  error: string | null;
}

const initialState: TaskDetailsState = {
  task: null,
  users: [],
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

// Асинхронный экшен для обновления приоритета задачи
export const updateTaskPriority = createAsyncThunk<Task, { id: number, priority: string }>(
  'taskDetails/updateTaskPriority',
  async ({ id, priority }) => {
    const updatedTask = await taskAPI.updateTaskPriority(id, priority);
    return updatedTask;
  }
);

// Асинхронный экшен для назначения ответственного
export const assignTaskResponsible = createAsyncThunk<Task, { id: number, responsible_id: number | null }>(
  'taskDetails/assignTaskResponsible',
  async ({ id, responsible_id }) => {
    if (responsible_id) {
      return await taskAPI.updateTaskResponsible(id, responsible_id);  // Для назначения
    } else {
      return await taskAPI.removeResponsible(id);  // Для снятия
    }
  }
);

// Асинхронный экшен для снятия ответственного
export const removeResponsible = createAsyncThunk<Task, number>(
  'taskDetails/removeResponsible',
  async (taskId) => {
    const updatedTask = await taskAPI.removeResponsible(taskId);
    return updatedTask;
  }
);

// Асинхронный экшен для добавления комментария
export const addComment = createAsyncThunk<void, { taskId: number, text: string }>(
  'taskDetails/addComment',
  async ({ taskId, text }) => {
    await taskAPI.addComment(taskId, text);
  }
);

// Асинхронный экшен для получения списка пользователей
export const loadUsers = createAsyncThunk<User[]>(
  'taskDetails/loadUsers',
  async () => {
    const users = await taskAPI.fetchUsers();
    return users;
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
      .addCase(updateTaskPriority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload; // Обновляем только если ID совпадает
        }
      })
      .addCase(updateTaskPriority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(assignTaskResponsible.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTaskResponsible.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload; // Обновляем только если ID совпадает
        }
      })
      .addCase(assignTaskResponsible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(removeResponsible.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeResponsible.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload; // Обновляем только если ID совпадает
        }
      })
      .addCase(removeResponsible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state) => {
        state.loading = false;
        // Просто обновляем комментарии в Redux (если они загружаются отдельно)
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      });
  },
});

export default taskDetailsSlice.reducer;
