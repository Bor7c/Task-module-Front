import { User } from "./User";

export interface Comment {
  id: number;
  task: number;         // ID задачи
  author: User;         // Полная информация об авторе
  text: string;
  created_at: string;   // ISO строка даты
  updated_at?: string;  // Опционально, если комментарии можно редактировать
  is_system: boolean;   // Системный ли комментарий
}

export interface TaskStatus {
  code: string;         // Например: 'open', 'in_progress'
  display: string;      // Например: 'Открыта', 'В работе'
}

export interface TaskPriority {
  code: string;         // Например: 'low', 'high'
  display: string;      // Например: 'Низкий', 'Высокий'
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;       // Код статуса
  status_display?: string; // Отображаемое название статуса
  priority: string;     // Код приоритета
  priority_display?: string; // Отображаемое название приоритета
  responsible: User | null; // Ответственный пользователь
  created_by: User;     // Автор задачи
  created_at: string;   // ISO строка даты создания
  updated_at: string;   // ISO строка даты обновления
  deadline: string | null; // ISO строка дедлайна или null
  comments?: Comment[]; // Опциональный массив комментариев
  
  // Дополнительные поля, которые могут быть полезны
  tags?: string[];      // Теги задачи
  is_closed?: boolean;  // Флаг закрытия задачи
}

// Дополнительные типы для работы с задачами
export interface TaskCreateData {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  responsible_id?: number | null;
  deadline?: string | null;
}

export interface TaskUpdateData extends Partial<TaskCreateData> {
  // Можно добавить специфичные для обновления поля
}