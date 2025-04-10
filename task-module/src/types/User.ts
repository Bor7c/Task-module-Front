export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  role_display?: string;  // Добавляем опциональное поле для отображаемого названия роли
  is_staff?: boolean;     // Флаг администратора/персонала
}

// Для совместимости с существующим кодом
export type UserData = User;

// Дополнительные типы, если нужно
export interface UserProfile extends User {
  last_login?: string;
  date_joined?: string;
  is_active?: boolean;
}