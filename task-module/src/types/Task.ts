export interface Task {
  id: number;
  title: string;
  description: string;
  status: string; // Добавляем статус
  comments?: Comment[]; // Добавляем комментарии
}

export interface Comment {
  id: number;
  text: string;
  created_at: string;
}