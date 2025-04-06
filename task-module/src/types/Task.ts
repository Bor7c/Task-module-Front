import { User } from "./User";

export interface Comment {
  id: number;
  task: number;
  author: User;
  text: string;
  created_at: string;
  is_system: boolean;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  responsible: User | null;
  created_by: User;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  comments?: Comment[]; // Делаем поле необязательным
}