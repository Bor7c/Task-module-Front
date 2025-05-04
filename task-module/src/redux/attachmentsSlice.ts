import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as attachmentsApi from '../api/attachmentsApi';
import { Attachment } from '../types/Types';
import { AxiosError } from 'axios';

interface AttachmentsState {
  attachments: Attachment[];
  loading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: AttachmentsState = {
  attachments: [],
  loading: false,
  error: null,
  uploadProgress: 0,
};

// Fetch attachments for a specific task
export const fetchAttachments = createAsyncThunk(
  'attachments/fetchAttachments',
  async (taskId: number, { rejectWithValue }) => {
    try {
      return await attachmentsApi.getAttachments(taskId);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attachments');
    }
  }
);

// Upload attachments for a specific task
export const uploadAttachments = createAsyncThunk(
  'attachments/uploadAttachments',
  async ({ taskId, files }: { taskId: number; files: File[] }, { rejectWithValue }) => {
    try {
      const response = await attachmentsApi.uploadAttachments(taskId, files);
      return response; // Убедитесь, что API возвращает массив вложений
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to upload attachments');
    }
  }
);

// Remove an attachment
export const removeAttachment = createAsyncThunk(
  'attachments/removeAttachment',
  async (attachmentId: number, { rejectWithValue }) => {
    try {
      await attachmentsApi.deleteAttachment(attachmentId);
      return attachmentId; // Возвращаем ID для удаления из состояния
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to delete attachment');
    }
  }
);

const attachmentsSlice = createSlice({
  name: 'attachments',
  initialState,
  reducers: {
    setUploadProgress(state, action) {
      state.uploadProgress = action.payload;
    },
    clearAttachments(state) {
      state.attachments = [];
      state.error = null;
      state.uploadProgress = 0; // Сбрасываем прогресс загрузки
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttachments.fulfilled, (state, action) => {
        state.loading = false;
        state.attachments = action.payload; // Обновляем вложения
      })
      .addCase(fetchAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.uploadProgress = 0; // Сбрасываем прогресс перед загрузкой
      })
      .addCase(uploadAttachments.fulfilled, (state, action) => {
        state.loading = false;
        state.attachments = [...state.attachments, ...action.payload]; // Добавляем новые вложения
        state.uploadProgress = 0; // Сбрасываем прогресс после загрузки
      })
      .addCase(uploadAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0; // Сбрасываем прогресс в случае ошибки
      })
      .addCase(removeAttachment.fulfilled, (state, action) => {
        state.attachments = state.attachments.filter(
          (attachment) => attachment.id !== action.payload
        );
      });
  },
});

export const { setUploadProgress, clearAttachments } = attachmentsSlice.actions;
export default attachmentsSlice.reducer;
