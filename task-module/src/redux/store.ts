import { configureStore, Middleware } from '@reduxjs/toolkit';
import tasksReducer from './tasksSlice';

// Логирующий middleware
const loggerMiddleware: Middleware = (store) => (next) => (action) => {
  console.log('Dispatching action:', action);
  const result = next(action);
  console.log('Next state:', store.getState());
  return result;
};

const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,  // Отключаем проверку на сериализуемость для логов
    }).concat(loggerMiddleware),
});

// Типизация для RootState и AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;