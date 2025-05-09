import api from './axiosConfig';
import { User } from '../types/Types';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users/', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    throw error;
  }
};

export const fetchUserDetails = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}/`, {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки деталей пользователя:', error);
    throw error;
  }
};

export const updateUserProfilePicture = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('profile_picture', file);

  try {
    await api.post('/users/profile/upload-picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
  } catch (error) {
    console.error('Ошибка обновления фото профиля:', error);
    throw error;
  }
};

export const deleteUserProfilePicture = async (): Promise<void> => {
  try {
    await api.delete('/users/profile/delete-picture/', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
  } catch (error) {
    console.error('Ошибка удаления фото профиля:', error);
    throw error;
  }
};

export const updateUserInfo = async (
  userId: number,
  data: Partial<Pick<User, 'first_name' | 'last_name' | 'middle_name' | 'email' | 'username'>>
): Promise<User> => {
  try {
    const response = await api.patch(`/users/${userId}/`, data, {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    throw error;
  }
};
