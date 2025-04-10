import { User } from "./User";

export interface CommentBase {
  id: number;
  text: string;
  created_at: string;
  updated_at?: string;
}

export interface UserComment extends CommentBase {
  author: User;
  is_system: false;
  task: number; // ID задачи
}

export interface SystemComment extends CommentBase {
  author: { id: 0, username: 'system' };
  is_system: true;
  task: number; // ID задачи
}

export type Comment = UserComment | SystemComment;

// Для создания нового комментария
export interface CommentCreateData {
  text: string;
  task_id: number;
}