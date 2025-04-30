import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CreateTaskFormState {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null; // Добавляем поле для срока выполнения
}

const initialState: CreateTaskFormState = {
  title: '',
  description: '',
  priority: 'medium',
  deadline: null, // По умолчанию срок не установлен
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
    setDeadline(state, action: PayloadAction<string | null>) {
      state.deadline = action.payload;
    },
    resetForm(state) {
      Object.assign(state, initialState);
    }
  },
});

export const { 
  setTitle, 
  setDescription, 
  setPriority, 
  setDeadline, 
  resetForm 
} = createTaskFormSlice.actions;

export default createTaskFormSlice.reducer;