import React, { useState } from 'react';
import { Task } from '../../../types/Task';
import { User } from '../../../types/User';
import './TaskPriority.css';

type TaskPriorityProps = {
  task: Task;
  user: User | null;
  onPriorityChange: (priority: string) => void;
};

const priorityColors = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: 'var(--primary)'
};

const TaskPriority: React.FC<TaskPriorityProps> = ({ task, user, onPriorityChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(task.priority);

  const handleSave = () => {
    onPriorityChange(selectedPriority);
    setIsEditing(false);
  };

  return (
    <div className="priority-container">
      <h3 className="priority-title">Приоритет</h3>
      {isEditing ? (
        <div className="priority-edit">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="priority-select"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>
          <div className="priority-actions">
            <button className="save-btn" onClick={handleSave}>
              Сохранить
            </button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="priority-display">
          <span 
            className="priority-badge" 
            style={{ backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] }}
          >
            {task.priority_display}
          </span>
          {user?.id === task.created_by.id && (
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Изменить
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskPriority;