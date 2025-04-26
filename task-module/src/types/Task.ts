// types/Task.ts

import { User } from "./User";

// Экспортируем интерфейс Comment
export interface Comment {
  id: number;
  text: string;
  created_at: string;
  updated_at: string;
  is_system: boolean;
  is_modified: boolean;
  is_deleted: boolean;
  author: User;  // Автор комментария
}

// Обновляем статус и добавляем возможные значения
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priority_display: string;
  status: 'in_progress' | 'awaiting_response' | 'closed' | 'unassigned';
  status_display: string;
  responsible?: { username: string };
  created_at: string;
  deadline?: string;
  comments_count: number;
}

