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

interface TasksState {
  tasks: Task[];
  currentTask: (Task & { comments?: Comment[] }) | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
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
      const task = await fetchTaskById(id);
      const comments = await fetchComments(id);
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
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = { ...state.currentTask, ...action.payload };
        }
        state.tasks = state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        );
      })
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = { ...state.currentTask, ...action.payload };
        }
      })
      .addCase(updateTaskPriority.fulfilled, (state, action) => {
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = { ...state.currentTask, ...action.payload };
        }
        state.tasks = state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        );
      })
      .addCase(updateTaskResponsible.fulfilled, (state, action) => {
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = { ...state.currentTask, ...action.payload };
        }
        state.tasks = state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        );
      })
      .addCase(updateTaskTitle.fulfilled, (state, action) => {
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = { ...state.currentTask, ...action.payload };
        }
        state.tasks = state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        );
      })

      .addCase(updateExistingComment.fulfilled, (state, action) => {
        if (state.currentTask?.comments) {
          state.currentTask.comments = state.currentTask.comments.map(comment =>
            comment.id === action.payload.id ? action.payload : comment
          );
        }
      })
      .addCase(addNewComment.fulfilled, (state, action) => {
        if (state.currentTask) {
          state.currentTask.comments = [...(state.currentTask.comments || []), action.payload];
        }
      })
      .addCase(removeComment.fulfilled, (state, action) => {
        if (state.currentTask?.comments) {
          state.currentTask.comments = state.currentTask.comments.filter(
            comment => comment.id !== action.payload
          );
        }
      });
  },
});

export const { setTasks, clearTasks, setCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;