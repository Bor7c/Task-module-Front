import React, { useState } from 'react';
import { Task } from '../../types/Task';
import { User } from '../../types/User';

type TaskMetaProps = {
  task: Task;
  user: User | null;
  onResponsibleChange: (responsibleId: number | null) => void;
};

const TaskMeta: React.FC<TaskMetaProps> = ({ task, user, onResponsibleChange }) => {
  const [isChanging, setIsChanging] = useState(false);
  const [newResponsibleId, setNewResponsibleId] = useState<number | null>(task.responsible?.id || null);

  const handleSave = () => {
    onResponsibleChange(newResponsibleId);
    setIsChanging(false);
  };

  const renderResponsible = () => {
    if (isChanging) {
      return (
        <div className="responsible-edit">
          <input
            type="number"
            placeholder="ID пользователя"
            value={newResponsibleId || ''}
            onChange={(e) => setNewResponsibleId(Number(e.target.value) || null)}
            className="form-control form-control-sm"
            min="1"
          />
          <div className="edit-actions mt-2">
            <button 
              onClick={handleSave}
              className="btn btn-primary btn-sm"
            >
              Сохранить
            </button>
            <button 
              onClick={() => setIsChanging(false)}
              className="btn btn-outline-secondary btn-sm ms-2"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <span onClick={() => user?.id === task.created_by.id && setIsChanging(true)}>
        {task.responsible?.username || 'Не назначен'}
        {user?.id === task.created_by.id && (
          <i className="bi bi-pencil ms-1"></i>
        )}
      </span>
    );
  };

  return (
    <div className="task-info-grid">
      <div className="info-item">
        <span className="info-label">Создана:</span>
        <span>{new Date(task.created_at).toLocaleString()}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Автор:</span>
        <span>{task.created_by.username}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Ответственный:</span>
        {renderResponsible()}
      </div>
      {task.deadline && (
        <div className="info-item">
          <span className="info-label">Дедлайн:</span>
          <span>{new Date(task.deadline).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

export default TaskMeta;