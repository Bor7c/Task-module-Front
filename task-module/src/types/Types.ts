// Тип для пользователя
export type UserRole = 'admin' | 'manager' | 'developer';
// Типы для приоритета и статуса
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'in_progress' | 'solved' | 'closed' | 'awaiting_response' | 'awaiting_action';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  username: string;
  email: string;
  role: UserRole;
  role_display: string;
  is_active: boolean;
  profile_picture_url?: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  members: User[]; // или User[], если ты хранишь полных пользователей
}

export interface TeamTask {
  id: number;
  name: string;
  description?: string;
  members_count: number; // или User[], если ты хранишь полных пользователей
}

// Тип для задачи
export interface Task {
  id: number;
  title: string;
  team: TeamTask;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  responsible: User | null;
  is_assigned: boolean;
  created_by: User;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  deadline: string | null;
  is_deleted: boolean;

  // Дополнительные вычисляемые поля:
  priority_display: string;
  status_display: string;
  comments_count: number;
  is_overdue: boolean; // Новое свойство
}


// Тип для комментария
export interface Comment {
  id: number;
  task: Task; // Задача, к которой привязан комментарий
  author: User; // Автор комментария
  text: string; // Текст комментария
  created_at: string; // Дата создания
  updated_at: string; // Дата последнего обновления
  is_system: boolean; // Является ли это системным сообщением
  is_deleted: boolean; // Удалён ли комментарий
  is_modified: boolean; // Изменён ли комментарий
}

export interface Attachment {
  id: number;
  file_url: string;
  filename: string;
  uploaded_at: string;
  uploaded_by: {
    id: number;
    username: string;
    // Остальные поля делаем опциональными
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    email?: string;
    role?: UserRole;
    role_display?: string;
    is_active?: boolean;
    profile_picture_url?: string;
  };
  task: number;
}

