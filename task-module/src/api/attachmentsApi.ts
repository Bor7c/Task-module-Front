import axios from './axiosConfig';
import { AxiosError } from 'axios';

export interface Attachment {
  id: number;
  file_url: string;
  filename: string;
  uploaded_at: string;
}

interface ApiError {
  error?: string;
  message?: string;
}

export const getAttachments = async (taskId: number): Promise<Attachment[]> => {
  try {
    const response = await axios.get(`/tasks/${taskId}/attachments/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attachments:', error);
    throw new Error('Failed to fetch attachments');
  }
};

export const uploadAttachments = async (taskId: number, files: File[]): Promise<Attachment[]> => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await axios.post(`/tasks/${taskId}/attachments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('Error uploading attachments:', err);
    throw new Error(
      err.response?.data?.error || 
      err.response?.data?.message || 
      'Failed to upload attachments'
    );
  }
};

export const downloadAttachment = async (attachmentId: number): Promise<void> => {
  try {
    const response = await axios.get(`/attachments/${attachmentId}/`, {
      responseType: 'blob'
    });
    
    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `attachment_${attachmentId}`;
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    throw new Error('Failed to download attachment');
  }
};

export const deleteAttachment = async (attachmentId: number): Promise<void> => {
  try {
    await axios.delete(`/attachments/${attachmentId}/`);
  } catch (error) {
    const err = error as AxiosError<ApiError>;
    console.error('Error deleting attachment:', err);
    throw new Error(
      err.response?.data?.error || 
      err.response?.data?.message || 
      'Failed to delete attachment'
    );
  }
};