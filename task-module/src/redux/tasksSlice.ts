import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Comment } from '../types/Task';
import { 
  fetchTasks, 
  fetchTaskById, 
  fetchComments, 
  addComment, 
  deleteComment,
  updateTaskPriority as apiUpdateTaskPriority,
  updateTaskResponsible as apiUpdateTaskResponsible,
  updateTaskTitle as apiUpdateTaskTitle,
  updateTaskStatus as apiUpdateTaskStatus,
  updateTaskDescription as apiUpdateTaskDescription,
  updateComment as apiUpdateComment
} from '../api/tasks';
import api from '../api/axiosConfig';

interface TasksState {
  tasks: Task[];
  currentTask: (Task & { comments: Comment[] }) | null;
  loading: boolean;
  error: string | null;
  isUpdating: Record<string, boolean>;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  isUpdating: {},
};

export const loadTasks = createAsyncThunk<Task[], void, { rejectValue: string }>(
  'tasks/loadTasks',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchTasks();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadTaskById = createAsyncThunk<Task & { comments: Comment[] }, number, { rejectValue: string }>(
  'tasks/loadTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const [task, comments] = await Promise.all([
        fetchTaskById(id),
        fetchComments(id)
      ]);
      return { ...task, comments };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk<Task, { id: number; status: string }, { rejectValue: string }>(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await apiUpdateTaskStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskDescription = createAsyncThunk<Task, { id: number; description: string }, { rejectValue: string }>(
  'tasks/updateDescription',
  async ({ id, description }, { rejectWithValue }) => {
    try {
      return await apiUpdateTaskDescription(id, description);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingComment = createAsyncThunk<Comment, { id: number; text: string }, { rejectValue: string }>(
  'tasks/updateComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      return await apiUpdateComment(id, text);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskPriority = createAsyncThunk<Task, { id: number; priority: string }, { rejectValue: string }>(
  'tasks/updatePriority',
  async ({ id, priority }, { rejectWithValue }) => {
    try {
      return await apiUpdateTaskPriority(id, priority);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskResponsible = createAsyncThunk<Task, { id: number; responsible_id: number | null }, { rejectValue: string }>(
  'tasks/updateResponsible',
  async ({ id, responsible_id }, { rejectWithValue }) => {
    try {
      return await apiUpdateTaskResponsible(id, responsible_id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskTitle = createAsyncThunk<Task, { id: number; title: string }, { rejectValue: string }>(
  'tasks/updateTitle',
  async ({ id, title }, { rejectWithValue }) => {
    try {
      return await apiUpdateTaskTitle(id, title);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/`);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addNewComment = createAsyncThunk<Comment, { taskId: number; text: string }, { rejectValue: string }>(
  'tasks/addComment',
  async ({ taskId, text }, { rejectWithValue }) => {
    try {
      return await addComment(taskId, text);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeComment = createAsyncThunk<number, number, { rejectValue: string }>(
  'tasks/removeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await deleteComment(commentId);
      return commentId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
    },
    setCurrentTask: (state, action: PayloadAction<(Task & { comments?: Comment[] }) | null>) => {
      state.currentTask = action.payload ? { 
        ...action.payload, 
        comments: action.payload.comments || [] 
      } : null;
    },
    resetUpdateState: (state) => {
      state.isUpdating = {};
    }
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
        state.error = action.payload || 'Неизвестная ошибка';
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
        state.error = action.payload || 'Неизвестная ошибка';
      })
      .addCase(updateTaskStatus.pending, (state, action) => {
        state.isUpdating[`status_${action.meta.arg.id}`] = true;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const { id } = action.payload;
        delete state.isUpdating[`status_${id}`];
        
        if (state.currentTask?.id === id) {
          state.currentTask.status = action.payload.status;
        }
        state.tasks = state.tasks.map(task => 
          task.id === id ? { ...task, status: action.payload.status } : task
        );
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        const id = action.meta.arg.id;
        delete state.isUpdating[`status_${id}`];
      })
      .addCase(updateTaskDescription.pending, (state, action) => {
        state.isUpdating[`desc_${action.meta.arg.id}`] = true;
      })
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        const { id } = action.payload;
        delete state.isUpdating[`desc_${id}`];
        
        if (state.currentTask?.id === id) {
          state.currentTask.description = action.payload.description;
        }
      })
      .addCase(updateTaskPriority.pending, (state, action) => {
        state.isUpdating[`priority_${action.meta.arg.id}`] = true;
      })
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        const { id } = action.payload;
        delete state.isUpdating[`priority_${id}`];
        
        if (state.currentTask?.id === id) {
          state.currentTask.priority = action.payload.priority;
        }
        state.tasks = state.tasks.map(task => 
          task.id === id ? { ...task, priority: action.payload.priority } : task
        );
      })
      .addCase(updateTaskResponsible.pending, (state, action) => {
        state.isUpdating[`responsible_${action.meta.arg.id}`] = true;
      })
      .addCase(updateTaskResponsible.fulfilled, (state, action) => {
        const { id } = action.payload;
        delete state.isUpdating[`responsible_${id}`];
        
        if (state.currentTask?.id === id) {
          state.currentTask.responsible = action.payload.responsible;
        }
        state.tasks = state.tasks.map(task => 
          task.id === id ? { ...task, responsible: action.payload.responsible } : task
        );
      })
      .addCase(updateTaskTitle.pending, (state, action) => {
        state.isUpdating[`title_${action.meta.arg.id}`] = true;
      })
      .addCase(updateTaskTitle.fulfilled, (state, action) => {
        const { id } = action.payload;
        delete state.isUpdating[`title_${id}`];
        
        if (state.currentTask?.id === id) {
          state.currentTask.title = action.payload.title;
        }
        state.tasks = state.tasks.map(task => 
          task.id === id ? { ...task, title: action.payload.title } : task
        );
      })
      .addCase(updateExistingComment.pending, (state, action) => {
        state.isUpdating[`comment_${action.meta.arg.id}`] = true;
      })
      .addCase(updateExistingComment.fulfilled, (state, action) => {
        delete state.isUpdating[`comment_${action.payload.id}`];
        if (state.currentTask?.comments) {
          state.currentTask.comments = state.currentTask.comments.map(comment =>
            comment.id === action.payload.id ? action.payload : comment
          );
        }
      })
      builder.addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })

      .addCase(addNewComment.pending, (state) => {
        state.isUpdating['adding_comment'] = true;
      })
      .addCase(addNewComment.fulfilled, (state, action) => {
        delete state.isUpdating['adding_comment'];
        if (state.currentTask) {
          state.currentTask.comments = [...(state.currentTask.comments || []), action.payload];
        }
      })
      .addCase(removeComment.pending, (state, action) => {
        state.isUpdating[`removing_comment_${action.meta.arg}`] = true;
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        delete state.isUpdating[`removing_comment_${action.payload}`];
        if (state.currentTask?.comments) {
          state.currentTask.comments = state.currentTask.comments.filter(
            comment => comment.id !== action.payload
          );
        }
      });
  },
});

export const { 
  setTasks, 
  clearTasks, 
  setCurrentTask,
  resetUpdateState
} = tasksSlice.actions;

export default tasksSlice.reducer;