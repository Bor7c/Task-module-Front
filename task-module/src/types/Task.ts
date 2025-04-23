import { User } from "./User";

export interface Comment {
  id: number;
  text: string;
  created_at: string;
  is_system: boolean;
  is_modified: boolean;
  author: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  status_display: string;
  priority: string;
  priority_display: string;
  responsible: User | null;
  created_by: User;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  comments_count: number;
  comments?: Comment[];
}