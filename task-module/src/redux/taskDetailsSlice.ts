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

// Вспомогательные редьюсеры
const setLoading = (state: TaskDetailsState) => {
  state.loading = true;
  state.error = null;
};

const setError = (state: TaskDetailsState, action: any) => {
  state.loading = false;
  state.error = action.error.message || 'Произошла ошибка';
};

// Асинхронные экшены
export const loadTaskById = createAsyncThunk<Task, number>(
  'taskDetails/loadTaskById',
  async (id) => {
    const task = await taskAPI.fetchTaskById(id);
    return task;
  }
);

export const updateTaskStatus = createAsyncThunk<Task, { id: number, status: string }>(
  'taskDetails/updateTaskStatus',
  async ({ id, status }) => {
    return await taskAPI.updateTaskStatus(id, status);
  }
);

export const updateTaskPriority = createAsyncThunk<Task, { id: number, priority: string }>(
  'taskDetails/updateTaskPriority',
  async ({ id, priority }) => {
    return await taskAPI.updateTaskPriority(id, priority);
  }
);

export const assignTaskResponsible = createAsyncThunk<Task, { id: number, responsible_id: number }>(
  'taskDetails/assignTaskResponsible',
  async ({ id, responsible_id }) => {
    return await taskAPI.updateTaskResponsible(id, responsible_id);
  }
);

export const removeResponsible = createAsyncThunk<Task, number>(
  'taskDetails/removeResponsible',
  async (id) => {
    return await taskAPI.removeResponsible(id);
  }
);

export const updateTaskTitle = createAsyncThunk<Task, { id: number, title: string }>(
  'taskDetails/updateTaskTitle',
  async ({ id, title }) => {
    return await taskAPI.updateTaskTitle(id, title);
  }
);

export const updateTaskDescription = createAsyncThunk<Task, { id: number, description: string }>(
  'taskDetails/updateTaskDescription',
  async ({ id, description }) => {
    return await taskAPI.updateTaskDescription(id, description);
  }
);

// Комментарии
export const addComment = createAsyncThunk<Comment, { taskId: number, text: string }>(
  'taskDetails/addComment',
  async ({ taskId, text }) => {
    return await commentsAPI.addComment(taskId, text);
  }
);

export const loadComments = createAsyncThunk<Comment[], number>(
  'taskDetails/loadComments',
  async (taskId) => {
    return await commentsAPI.fetchComments(taskId);
  }
);

export const removeComment = createAsyncThunk<number, number>(
  'taskDetails/removeComment',
  async (commentId) => {
    await commentsAPI.deleteComment(commentId);
    return commentId;
  }
);

export const updateComment = createAsyncThunk<Comment, { id: number, text: string }>(
  'taskDetails/updateComment',
  async ({ id, text }) => {
    return await commentsAPI.updateComment(id, text);
  }
);

export const loadUsers = createAsyncThunk<User[]>(
  'taskDetails/loadUsers',
  async () => {
    return await taskAPI.fetchUsers();
  }
);

export const deleteTask = createAsyncThunk(
  'taskDetails/deleteTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(taskId);
      return taskId; // можно вернуть, если нужно фильтровать потом
    } catch (error) {
      return rejectWithValue('Ошибка при удалении задачи');
    }
  }
);

export const resetTaskDetails = createAction('taskDetails/resetTaskDetails');

// Slice
const taskDetailsSlice = createSlice({
  name: 'taskDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTaskById.pending, setLoading)
      .addCase(loadTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.task = action.payload;
      })
      .addCase(loadTaskById.rejected, (state, action) => {
        setError(state, action);
        state.task = null;
        state.comments = [];
      })

      .addCase(updateTaskStatus.pending, setLoading)
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) state.task = action.payload;
      })
      .addCase(updateTaskStatus.rejected, setError)

      .addCase(updateTaskPriority.pending, setLoading)
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) state.task = action.payload;
      })
      .addCase(updateTaskPriority.rejected, setError)

      .addCase(assignTaskResponsible.pending, setLoading)
      .addCase(assignTaskResponsible.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) state.task = action.payload;
      })
      .addCase(assignTaskResponsible.rejected, setError)

      .addCase(removeResponsible.pending, setLoading)
      .addCase(removeResponsible.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) state.task = action.payload;
      })
      .addCase(removeResponsible.rejected, setError)

      .addCase(updateTaskTitle.pending, setLoading)
      .addCase(updateTaskTitle.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) state.task = action.payload;
      })
      .addCase(updateTaskTitle.rejected, setError)

      .addCase(updateTaskDescription.pending, setLoading)
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        state.loading = false;
        if (state.task?.id === action.payload.id) state.task = action.payload;
      })
      .addCase(updateTaskDescription.rejected, setError)

      .addCase(addComment.pending, setLoading)
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload);
      })
      .addCase(addComment.rejected, setError)

      .addCase(loadComments.pending, setLoading)
      .addCase(loadComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(loadComments.rejected, setError)

      .addCase(removeComment.pending, setLoading)
      .addCase(removeComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      })
      .addCase(removeComment.rejected, setError)

      .addCase(updateComment.pending, setLoading)
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.map(comment =>
          comment.id === action.payload.id ? action.payload : comment
        );
      })
      .addCase(updateComment.rejected, setError)

      .addCase(loadUsers.pending, setLoading)
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(loadUsers.rejected, setError)


      .addCase(deleteTask.pending, setLoading)
      .addCase(deleteTask.fulfilled, (state) => {
        state.loading = false;
        state.task = null;         // Удалили задачу, очищаем стейт
        state.comments = [];
      })
      .addCase(deleteTask.rejected, setError)

      .addCase(resetTaskDetails, (state) => {
        state.task = null;
        state.comments = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export default taskDetailsSlice.reducer;
