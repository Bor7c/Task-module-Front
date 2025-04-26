// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import tasksReducer from './tasksSlice';
import taskDetailsReducer from './taskDetailsSlice';
import usersReducer from './usersSlice'; // Импортируем usersSlice

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    taskDetails: taskDetailsReducer,
    users: usersReducer, // Добавляем usersReducer в store
  },
});

// Типизация для RootState и AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Создаем типизированные хуки
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
