// src/types/User.ts
export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    role_display?: string;  // Делаем необязательным
    is_staff?: boolean;     // Делаем необязательным
  }