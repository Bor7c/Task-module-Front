import api from './axiosConfig'; // Импортируем твой axios конфиг
import { User } from '../types/Types'; // Импортируем типы для пользователей

// Функция для получения списка пользователей
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users/', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '', // Убедитесь, что вы передаете ID сессии
      },
    });
    return response.data; // Возвращаем данные из ответа
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    throw error; // Пробрасываем ошибку дальше
  }
};

// Функция для получения деталей пользователя по ID
export const fetchUserDetails = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}/`, {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '', // Убедитесь, что вы передаете ID сессии
      },
    });
    return response.data; // Возвращаем данные из ответа
  } catch (error) {
    console.error('Ошибка загрузки деталей пользователя:', error);
    throw error; // Пробрасываем ошибку дальше
  }
};

// Функция для обновления фото профиля
export const updateUserProfilePicture = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('profile_picture', file); // Добавляем файл в FormData

  try {
    await api.post('/users/profile/upload-picture/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Указываем тип содержимого
        'X-Session-ID': localStorage.getItem('sessionId') || '', // Убедитесь, что вы передаете ID сессии
      },
    });
  } catch (error) {
    console.error('Ошибка обновления фото профиля:', error);
    throw error; // Пробрасываем ошибку дальше
  }
};


// Функция для удаления фото профиля
export const deleteUserProfilePicture = async (): Promise<void> => {
  try {
    await api.delete('/users/profile/delete-picture/', {
      headers: {
        'X-Session-ID': localStorage.getItem('sessionId') || '', // Убедитесь, что вы передаете ID сессии
      },
    });
  } catch (error) {
    console.error('Ошибка удаления фото профиля:', error);
    throw error; // Пробрасываем ошибку дальше
  }
};
