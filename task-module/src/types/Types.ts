// Тип для задачи
export interface Task {
  id: number;
  title: string;
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

// Типы для приоритета и статуса
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'in_progress' | 'solved' | 'closed' | 'awaiting_response' | 'awaiting_action';

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
  is_modified: boolean; // Удалён ли комментарий
}

// Тип для пользователя
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole; // Роль пользователя
  is_active: boolean; // Активность пользователя
}

export type UserRole = 'admin' | 'manager' | 'developer';

// Функция для отображения приоритета
const getPriorityDisplay = (priority: TaskPriority): string => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return 'Неизвестный'; // Этот default теперь теоретически недостижим
  }
};

// Функция для отображения статуса
const getStatusDisplay = (status: TaskStatus): string => {
  switch (status) {
    case 'in_progress': return 'В работе';
    case 'awaiting_response': return 'Ожидает ответа';
    case 'awaiting_action': return 'Ожидает действия';
    case 'solved': return 'Решено';
    case 'closed': return 'Закрыто';
    default: return 'Неизвестный статус'; // Этот default теоретически недостижим
  }
};
