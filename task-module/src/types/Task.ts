import { User } from "./User";

export interface Comment {
  id: number;
  text: string;
  created_at: string;
  modified_at?: string;
  is_system: boolean;
  is_modified: boolean;
  is_deleted: boolean;
  author: User;
  task?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  responsible: User | null;
  created_by: User;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  deadline: string | null;
  is_deleted: boolean;
  comments?: Comment[];
  comments_count?: number;
  is_closed?: boolean;
}

export interface TaskCreateUpdateData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  responsible_id?: number | null;
  deadline?: string | null;
}

export interface CommentCreateData {
  text: string;
  task_id?: number;
}