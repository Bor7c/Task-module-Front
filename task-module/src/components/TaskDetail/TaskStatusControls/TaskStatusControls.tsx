import React from 'react';
import { Task } from '../../../types/Task';
import { User } from '../../../types/User';
import './TaskStatusControls.css';

type TaskStatus = 
  | 'unassigned'
  | 'assigned'
  | 'in_progress'
  | 'solved'
  | 'closed'
  | 'awaiting_response'
  | 'awaiting_action';

type TaskStatusControlsProps = {
  task: Task;
  user: User | null;
  onStatusChange: (status: TaskStatus) => void;
  onTakeTask: () => void;
  onReleaseTask: () => void;
  onMarkSolved: () => void;
  onMarkClosed: () => void;
};

const TaskStatusControls: React.FC<TaskStatusControlsProps> = ({
  task,
  user,
  onStatusChange,
  onTakeTask,
  onReleaseTask,
  onMarkSolved,
  onMarkClosed,
}) => {
  if (!user) return null;
  
  const isCreator = user.id === task.created_by.id;
  const isResponsible = task.responsible?.id === user.id;
  const canEditStatus = isCreator || isResponsible;
  const currentStatus = task.status as TaskStatus;

  const renderStatusBadge = () => (
    <div className={`status-badge ${currentStatus}`}>
      <span className="status-text">
        {getStatusText(currentStatus)}
      </span>
    </div>
  );

  const renderStatusSelect = () => {
    const editableStatuses: TaskStatus[] = ['in_progress', 'awaiting_response', 'awaiting_action'];
    
    return (
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
        className="status-select"
      >
        {editableStatuses.map((status) => (
          <option key={status} value={status}>
            {getStatusText(status)}
          </option>
        ))}
      </select>
    );
  };

  const renderActionButtons = () => {
    if (task.status === 'unassigned' && !isCreator) {
      return (
        <button 
          onClick={onTakeTask}
          className="action-btn take-btn"
        >
          Взять в работу
        </button>
      );
    }

    if (task.status === 'assigned' && isResponsible) {
      return (
        <div className="action-buttons-group">
          <button 
            onClick={onReleaseTask}
            className="action-btn release-btn"
          >
            Снять задачу
          </button>
          <button 
            onClick={() => onStatusChange('in_progress')}
            className="action-btn start-btn"
          >
            Начать работу
          </button>
        </div>
      );
    }

    if (['assigned', 'in_progress', 'awaiting_response', 'awaiting_action'].includes(task.status) && isResponsible) {
      return (
        <button 
          onClick={onMarkSolved}
          className="action-btn solve-btn"
        >
          Отметить как решенное
        </button>
      );
    }

    if (task.status === 'solved' && isCreator) {
      return (
        <button 
          onClick={onMarkClosed}
          className="action-btn close-btn"
        >
          Закрыть задачу
        </button>
      );
    }

    return null;
  };

  return (
    <div className="status-container">
      <div className="status-header">
        <h3 className="status-title">Статус задачи:</h3>
        {renderStatusBadge()}
      </div>
      
      <div className="status-actions">
        {canEditStatus && (
          <>
            {['in_progress', 'awaiting_response', 'awaiting_action'].includes(task.status) && renderStatusSelect()}
            {renderActionButtons()}
          </>
        )}
      </div>
    </div>
  );
};

// Вспомогательная функция для получения текста статуса
function getStatusText(status: TaskStatus): string {
  const statusTexts = {
    unassigned: 'Не назначен',
    assigned: 'Назначен',
    in_progress: 'В работе',
    solved: 'Решен',
    closed: 'Закрыт',
    awaiting_response: 'Ожидает ответа',
    awaiting_action: 'Ожидает действий'
  };
  return statusTexts[status];
}

export default TaskStatusControls;