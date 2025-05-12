import React from 'react';
import { FaUserPlus, FaRegClock, FaExclamationCircle } from 'react-icons/fa';
import Avatar from '../../components/Avatar/Avatar';
import { Task, User } from '../../types/Types';

interface TaskInfoBlockProps {
  task: Task;
  localStatus: string;
  formatDate: (s: string) => string;
  getStatusClass: (s: any) => string;
  localPriority: string;
  handlePriorityChange: (s: string) => void;
  getPriorityClass: (s: string) => string;
  handleAssignResponsible: (id: number) => void;
  handleRemoveResponsible: () => void;
  currentUser: User | null;
  isReadOnly: boolean;
  isUpdatingResponsible: boolean;
  localResponsible: User | null;
}

const TaskInfoBlock: React.FC<TaskInfoBlockProps> = ({
  task,
  localStatus,
  formatDate,
  getStatusClass,
  localPriority,
  handlePriorityChange,
  getPriorityClass,
  handleAssignResponsible,
  handleRemoveResponsible,
  currentUser,
  isReadOnly,
  isUpdatingResponsible,
  localResponsible,
}) => (
  <div className="task-detail__info-card">
    {/* Статус */}
    <div className="task-detail__info-section">
      <h3>Статус</h3>
      <div className={`task-detail__status-badge ${getStatusClass(localStatus)}`}>{task.status_display}</div>
      {task.updated_at && (
        <p className="task-detail__timestamp"><FaRegClock /> Обновлено: {formatDate(task.updated_at)}</p>
      )}
    </div>

    {/* Приоритет */}
    <div className="task-detail__info-section">
      <h3>Приоритет</h3>
      <div className="task-detail__priority-selector">
        <select
          value={localPriority}
          onChange={(e) => handlePriorityChange(e.target.value)}
          className={`task-detail__priority-select ${getPriorityClass(localPriority)}`}
          disabled={isReadOnly}
        >
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
          <option value="critical">Критический</option>
        </select>
      </div>
    </div>

    {/* Ответственный */}
    <div className="task-detail__info-section">
      <h3>Ответственный</h3>
      <div className="task-detail__responsible-info">
        <div
          className={`task-detail__user-display ${isUpdatingResponsible ? 'loading' : ''}`}
          style={{ opacity: isUpdatingResponsible ? 0.6 : 1 }}
        >
          {localResponsible ? (
            <>
              <Avatar
                src={localResponsible.profile_picture_url}
                alt={localResponsible.username}
                fallbackText={localResponsible.username}
                className="task-detail__avatar"
              />
              <div className="task-detail__user-info">
                <span className="task-detail__user-name">{localResponsible.username}</span>
                <span className="task-detail__user-role">{localResponsible.role_display}</span>
              </div>
            </>
          ) : <p>Не назначен</p>}
        </div>

        <div className="task-detail__responsible-controls">
          {localResponsible && (
            <button
              onClick={handleRemoveResponsible}
              className="task-detail__remove-responsible-btn"
              title="Снять ответственного"
              disabled={isReadOnly || isUpdatingResponsible}
            >Снять</button>
          )}
          <select
            onChange={e => handleAssignResponsible(Number(e.target.value))}
            value={localResponsible?.id || ''}
            className="task-detail__user-select"
            disabled={isReadOnly || isUpdatingResponsible}
          >
            <option value="">
              {localResponsible ? localResponsible.username : 'Выбрать пользователя'}
            </option>
            {task.team.members.map(member =>
              member.id !== localResponsible?.id && (
                <option key={member.id} value={member.id}>{member.username}</option>
              )
            )}
          </select>
        </div>

        <button
          onClick={() => handleAssignResponsible(currentUser?.id || 0)}
          className="task-detail__assign-btn"
          disabled={currentUser?.id === localResponsible?.id || isReadOnly || isUpdatingResponsible}
        >
          <FaUserPlus /> Назначить на меня
        </button>

        {isUpdatingResponsible && (
          <div className="task-detail__loader">Обновление...</div>
        )}
      </div>
    </div>

    {/* Информация о задаче */}
    <div className="task-detail__info-section">
      <h3>Информация о задаче</h3>
      <div className="task-detail__additional-info">
        <p><strong>Создана:</strong> {formatDate(task.created_at)}</p>
        <p><strong>Автор:</strong></p>
        <div className="task-detail__user-display">
          <Avatar
            src={task.created_by.profile_picture_url}
            alt={task.created_by.username}
            fallbackText={task.created_by.username}
            className="task-detail__avatar"
          />
          <div className="task-detail__user-info">
            <span className="task-detail__user-name">{task.created_by.username}</span>
            <span className="task-detail__user-role">{task.created_by.role_display}</span>
          </div>
        </div>
        {task.deadline && (
          <p className={task.is_overdue ? 'task-detail__overdue-text' : ''}>
            <strong>Срок выполнения:</strong> {formatDate(task.deadline)}
          </p>
        )}
        {task.closed_at && (
          <p className={task.is_overdue ? 'task-detail__late-closed' : 'task-detail__on-time-closed'}>
            <strong>Закрыта:</strong> {formatDate(task.closed_at)}
          </p>
        )}
        {task.is_overdue && task.status === 'closed' && (
          <p className="task-detail__overdue-note">
            <FaExclamationCircle /> Задача была закрыта после срока выполнения
          </p>
        )}
      </div>
    </div>

    {/* Информация о команде */}
    <div className="task-detail__info-section">
      <h3>Команда {task.team.name}</h3>
    </div>
  </div>
);

export default TaskInfoBlock;
