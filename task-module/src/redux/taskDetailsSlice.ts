import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskAPI from '../api/taskDetailsAPI';  // Импортируем API функции
import * as commentsAPI from '../api/commentsApi';  // Импортируем API функции
import { Task, User, Comment } from '../types/Types';

// Интерфейс для состояния с данными задачи, пользователей и комментариев
interface TaskDetailsState {
  task: Task | null;
  users: User[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: TaskDetailsState = {
  task: null,
  users: [],
  comments: [],
  loading: false,
  error: null,
};

// Асинхронные экшены для загрузки данных

// Загрузка задачи по ID
export const loadTaskById = createAsyncThunk<Task, number>(
  'taskDetails/loadTaskById',
  async (id) => {
    const task = await taskAPI.fetchTaskById(id);
    return task;
  }
);

// Обновление статуса задачи
export const updateTaskStatus = createAsyncThunk<Task, { id: number, status: string }>(
  'taskDetails/updateTaskStatus',
  async ({ id, status }) => {
    const updatedTask = await taskAPI.updateTaskStatus(id, status);
    return updatedTask;
  }
);

// Обновление приоритета задачи
export const updateTaskPriority = createAsyncThunk<Task, { id: number, priority: string }>(
  'taskDetails/updateTaskPriority',
  async ({ id, priority }) => {
    const updatedTask = await taskAPI.updateTaskPriority(id, priority);
    return updatedTask;
  }
);

// Назначение ответственного
export const assignTaskResponsible = createAsyncThunk<Task, { id: number, responsible_id: number | null }>(
  'taskDetails/assignTaskResponsible',
  async ({ id, responsible_id }) => {
    if (responsible_id) {
      return await taskAPI.updateTaskResponsible(id, responsible_id);
    } else {
      return await taskAPI.removeResponsible(id);
    }
  }
);

// Удаление ответственного
export const removeResponsible = createAsyncThunk<Task, number>(
  'taskDetails/removeResponsible',
  async (id) => {
    const updatedTask = await taskAPI.removeResponsible(id);
    return updatedTask;
  }
);

// Обновление заголовка задачи
export const updateTaskTitle = createAsyncThunk<Task, { id: number, title: string }>(
  'taskDetails/updateTaskTitle',
  async ({ id, title }) => {
    const updatedTask = await taskAPI.updateTaskTitle(id, title);
    return updatedTask;
  }
);

// Обновление описания задачи
export const updateTaskDescription = createAsyncThunk<Task, { id: number, description: string }>(
  'taskDetails/updateTaskDescription',
  async ({ id, description }) => {
    const updatedTask = await taskAPI.updateTaskDescription(id, description);
    return updatedTask;
  }
);

// Добавление комментария
export const addComment = createAsyncThunk<Comment, { taskId: number, text: string }>(
  'taskDetails/addComment',
  async ({ taskId, text }) => {
    const newComment = await commentsAPI.addComment(taskId, text);
    return newComment;
  }
);

// Загрузка комментариев задачи
export const loadComments = createAsyncThunk<Comment[], number>(
  'taskDetails/loadComments',
  async (taskId) => {
    const comments = await commentsAPI.fetchComments(taskId);
    return comments;
  }
);

// Загрузка пользователей
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
      // Загрузка задачи по ID
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
      // Обновление статуса задачи
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Обновление приоритета задачи
      .addCase(updateTaskPriority.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskPriority.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Назначение ответственного
      .addCase(assignTaskResponsible.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTaskResponsible.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(assignTaskResponsible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Удаление ответственного
      .addCase(removeResponsible.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeResponsible.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(removeResponsible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Обновление заголовка задачи
      .addCase(updateTaskTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskTitle.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Обновление описания задачи
      .addCase(updateTaskDescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskDescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Добавление комментария
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task && state.task.id === action.payload.task.id) {
          state.comments.push(action.payload);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Загрузка комментариев
      .addCase(loadComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(loadComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      // Загрузка пользователей
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
