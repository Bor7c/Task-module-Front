import React from 'react';
import { Task } from '../../types/Types';
import './TaskCard.css'; // Стили для карточки

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  getPriorityColor: (priority: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, getPriorityColor }) => {
  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-badges">
          <span
            className="priority-badge"
            style={{
              backgroundColor: getPriorityColor(task.priority),
              color: '#222' // Темный текст
            }}
          >
            {task.priority_display}
          </span>
        </div>
      </div>

      <div className="task-meta">
        <div className="meta-item">
          <i className="icon-calendar"></i>
          <span className="meta-text">
            Создано: {new Date(task.created_at).toLocaleDateString('ru-RU')}
          </span>
        </div>
        {task.deadline && (
          <div className="meta-item">
            <i className="icon-clock"></i>
            <span className="meta-text">
              Срок: {new Date(task.deadline).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}
      </div>

      <div className="task-footer">
        <div className="footer-item">
          <i className="icon-user"></i>
          <span className="meta-text">
            {task.responsible?.username || 'Не назначен'}
          </span>
        </div>
        <div className="footer-item">
          <i className="icon-comment"></i>
          <span>{task.comments_count || 0} комментариев</span>
        </div>
        <div className="footer-item">
          <i className="icon-eye"></i>
          <span>Подробнее</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
