// src/api/users.ts
import api from './axiosConfig'; // Импортируем твой axios конфиг
import { User } from '../types/Types'; // Импортируем типы для пользователей

// Функция для получения списка пользователей
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users/'); // Отправляем GET запрос к API для получения пользователей
    return response.data; // Возвращаем данные из ответа
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    throw error; // Пробрасываем ошибку дальше, чтобы обработать её на уровне компонента
  }
};
