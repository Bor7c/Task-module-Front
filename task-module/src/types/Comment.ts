import { User } from "./User";

export interface Comment {
  id: number;
  text: string;
  created_at: string;
  is_system: boolean;
  author: {
    id: number;
    username: string;
    role?: string;
  };
  task?: number; // Опционально, если не всегда нужно
}

// Для создания комментария
export interface CommentCreateData {
  text: string;
  task_id?: number; // Опционально, если передается через URL
}