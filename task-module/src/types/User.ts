// types/User.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Добавляем псевдоним для совместимости
export type UserData = User;