import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import * as taskAPI from '../api/taskDetailsAPI';
import * as commentsAPI from '../api/commentsApi';
import { Task, User, Comment } from '../types/Types';

interface TaskDetailsState {
  task: Task | null;
  users: User[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskDetailsState = {
  task: null,
  users: [],
  comments: [],
  loading: false,
  error: null,
};

// Асинхронные экшены для загрузки данных
export const loadTaskById = createAsyncThunk<Task, number>(
  'taskDetails/loadTaskById',
  async (id) => {
    try {
      const task = await taskAPI.fetchTaskById(id);
      return task;
    } catch (error) {
      throw new Error('Не удалось загрузить задачу');
    }
  }
);

export const updateTaskStatus = createAsyncThunk<Task, { id: number, status: string }>(
  'taskDetails/updateTaskStatus',
  async ({ id, status }) => {
    try {
      const updatedTask = await taskAPI.updateTaskStatus(id, status);
      return updatedTask;
    } catch (error) {
      throw new Error('Не удалось обновить статус задачи');
    }
  }
);

export const updateTaskPriority = createAsyncThunk<Task, { id: number, priority: string }>(
  'taskDetails/updateTaskPriority',
  async ({ id, priority }) => {
    try {
      const updatedTask = await taskAPI.updateTaskPriority(id, priority);
      return updatedTask;
    } catch (error) {
      throw new Error('Не удалось обновить приоритет задачи');
    }
  }
);

export const assignTaskResponsible = createAsyncThunk<Task, { id: number, responsible_id: number | null }>(
  'taskDetails/assignTaskResponsible',
  async ({ id, responsible_id }) => {
    try {
      if (responsible_id) {
        return await taskAPI.updateTaskResponsible(id, responsible_id);
      } else {
        return await taskAPI.removeResponsible(id);
      }
    } catch (error) {
      throw new Error('Не удалось назначить ответственного');
    }
  }
);

export const removeResponsible = createAsyncThunk<Task, number>(
  'taskDetails/removeResponsible',
  async (id) => {
    try {
      const updatedTask = await taskAPI.removeResponsible(id);
      return updatedTask;
    } catch (error) {
      throw new Error('Не удалось удалить ответственного');
    }
  }
);

export const updateTaskTitle = createAsyncThunk<Task, { id: number, title: string }>(
  'taskDetails/updateTaskTitle',
  async ({ id, title }) => {
    try {
      const updatedTask = await taskAPI.updateTaskTitle(id, title);
      return updatedTask;
    } catch (error) {
      throw new Error('Не удалось обновить заголовок задачи');
    }
  }
);

export const updateTaskDescription = createAsyncThunk<Task, { id: number, description: string }>(
  'taskDetails/updateTaskDescription',
  async ({ id, description }) => {
    try {
      const updatedTask = await taskAPI.updateTaskDescription(id, description);
      return updatedTask;
    } catch (error) {
      throw new Error('Не удалось обновить описание задачи');
    }
  }
);

// Методы для работы с комментариями
export const addComment = createAsyncThunk<Comment, { taskId: number, text: string }>(
  'taskDetails/addComment',
  async ({ taskId, text }) => {
    try {
      const newComment = await commentsAPI.addComment(taskId, text);
      return newComment;
    } catch (error) {
      throw new Error('Не удалось добавить комментарий');
    }
  }
);

export const loadComments = createAsyncThunk<Comment[], number>(
  'taskDetails/loadComments',
  async (taskId) => {
    try {
      const comments = await commentsAPI.fetchComments(taskId);
      return comments;
    } catch (error) {
      throw new Error('Не удалось загрузить комментарии');
    }
  }
);

export const removeComment = createAsyncThunk<number, number>(
  'taskDetails/removeComment',
  async (commentId) => {
    try {
      await commentsAPI.deleteComment(commentId);
      return commentId;
    } catch (error) {
      throw new Error('Не удалось удалить комментарий');
    }
  }
);

export const updateComment = createAsyncThunk<Comment, { id: number, text: string }>(
  'taskDetails/updateComment',
  async ({ id, text }) => {
    try {
      const updatedComment = await commentsAPI.updateComment(id, text);
      return updatedComment;
    } catch (error) {
      throw new Error('Не удалось обновить комментарий');
    }
  }
);

export const loadUsers = createAsyncThunk<User[]>(
  'taskDetails/loadUsers',
  async () => {
    try {
      const users = await taskAPI.fetchUsers();
      return users;
    } catch (error) {
      throw new Error('Не удалось загрузить пользователей');
    }
  }
);

// Экшен для сброса данных задачи (для очистки при переходах)
export const resetTaskDetails = createAction('taskDetails/resetTaskDetails');

const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
        // Не чистим задачу, чтобы не мигало, но можно обнулить стейт если нужно визуально обнулить
        // state.task = null;
        // state.comments = [];
      })
      .addCase(loadTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
      })
      .addCase(loadTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
        state.task = null;
        state.comments = [];
      })
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) {
          state.task = action.payload;
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
        if (state.task?.id === action.payload.id) {
          state.task = action.payload;
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
        if (state.task?.id === action.payload.id) {
          state.task = action.payload;
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
        if (state.task?.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(removeResponsible.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(updateTaskTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskTitle.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(updateTaskDescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTaskDescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.task.id) {
          state.comments.push(action.payload);
        }
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
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
      .addCase(removeComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      })
      .addCase(removeComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Произошла ошибка';
      })
      .addCase(updateComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map(comment =>
          comment.id === action.payload.id ? action.payload : comment
        );
      })
      .addCase(updateComment.rejected, (state, action) => {
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
      })
      .addCase(resetTaskDetails, (state) => {
        state.task = null;
        state.comments = [];
        state.loading = false;
        state.error = null;
        // не сбрасываем пользователей — перелистывание задач не должно их терять
      });
  },
});

export default taskDetailsSlice.reducer;
