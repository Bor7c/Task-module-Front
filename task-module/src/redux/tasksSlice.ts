import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Comment } from '../types/Task';
import { fetchTasks, fetchTaskById, fetchComments, addComment, deleteComment } from '../api/tasks';

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

export const loadTasks = createAsyncThunk('tasks/loadTasks', async (_, { rejectWithValue }) => {
  try {
    return await fetchTasks();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const loadTaskById = createAsyncThunk('tasks/loadTaskById', async (id: number, { rejectWithValue }) => {
  try {
    const task = await fetchTaskById(id);
    const comments = await fetchComments(id);
    return { ...task, comments };
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const addNewComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, text }: { taskId: number; text: string }, { rejectWithValue }) => {
    try {
      return await addComment(taskId, text);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeComment = createAsyncThunk(
  'tasks/removeComment',
  async (commentId: number, { rejectWithValue }) => {
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
      })
      .addCase(addNewComment.fulfilled, (state, action) => {
        if (state.currentTask) {
          state.currentTask.comments = state.currentTask.comments || [];
          state.currentTask.comments.push(action.payload);
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