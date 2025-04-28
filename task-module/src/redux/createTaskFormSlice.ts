import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreateTaskFormState {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const initialState: CreateTaskFormState = {
  title: '',
  description: '',
  priority: 'medium',
};

const createTaskFormSlice = createSlice({
  name: 'createTaskForm',
  initialState,
  reducers: {
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setDescription(state, action: PayloadAction<string>) {
      state.description = action.payload;
    },
    setPriority(state, action: PayloadAction<'low' | 'medium' | 'high' | 'critical'>) {
      state.priority = action.payload;
    },
    resetForm(state) {
      Object.assign(state, initialState);
    }
  },
});

export const { setTitle, setDescription, setPriority, resetForm } = createTaskFormSlice.actions;
export default createTaskFormSlice.reducer;
