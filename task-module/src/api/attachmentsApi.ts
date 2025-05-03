import axios from './axiosConfig';

export const getAttachments = async (taskId: number) => {
    const response = await axios.get(`/tasks/${taskId}/attachments/`);
    return response.data;
};

export const uploadAttachments = async (taskId: number, files: File[]) => {
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
};

export const deleteAttachment = async (attachmentId: number) => {
    await axios.delete(`/attachments/${attachmentId}/`);
};