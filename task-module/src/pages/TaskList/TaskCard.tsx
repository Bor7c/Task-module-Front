import React from 'react';
import {
  FaExclamationCircle, FaBell, FaRegClock, FaRegCalendarAlt, FaComments, FaUsers
} from 'react-icons/fa';
import { Task } from '../../types/Types';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 345600) return `${Math.floor(diff / 86400)} дн назад`;
  return date.toLocaleString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface Props {
  task: Task;
  completedStatuses: string[];
  isToday: (date: string) => boolean;
  formatDate: (date: string) => string;
  handleTaskClick: (id: number) => void;
  getProfilePicture: (user: any) => string | null;
}

const TaskCard: React.FC<Props> = ({
  task, completedStatuses, isToday, formatDate, handleTaskClick, getProfilePicture
}) => {
  const isTaskToday = task.deadline && isToday(task.deadline);
  const isTaskOverdue = task.is_overdue;
  const profilePicture = task.responsible ? getProfilePicture(task.responsible) : null;
  const updatedAgo = timeAgo(task.updated_at);

  // Подсветка: давно не обновлялось (>7 дней)
  const highlightOld = (() => {
    if (!task.updated_at) return false;
    const diffDays = Math.floor((Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  })();

  return (
    <div
      className={
        "task-list__card" +
        (isTaskToday ? ' task-list__card--today' : '') +
        (isTaskOverdue ? ' task-list__card--overdue' : '') +
        (highlightOld ? ' task-list__card--old' : '')
      }
      onClick={() => handleTaskClick(task.id)}
      title={task.title}
    >
      <div className="task-list__card-header">
        <div className={`task-list__priority task-list__priority-${task.priority}`}>
          {task.priority_display}
        </div>
        <div className="task-list__task-id">#{task.id}</div>
      </div>
      <h3 className="task-list__card-title">{task.title}</h3>
      {task.team && (
        <div className="task-list__card-team">
          <FaUsers style={{ marginRight: 4 }} /> {task.team.name}
        </div>
      )}
      {(isTaskToday || isTaskOverdue) && (
        <div className="task-list__card-status">
          {isTaskOverdue && (
            <span className="task-list__card-status-badge task-list__card-status-overdue">
              <FaExclamationCircle />
              {completedStatuses.includes(task.status)
                ? 'Завершена с просрочкой'
                : 'Просрочена'}
            </span>
          )}
          {isTaskToday && !isTaskOverdue && (
            <span className="task-list__card-status-badge task-list__card-status-today">
              <FaBell /> Последний день
            </span>
          )}
        </div>
      )}
      <div className="task-list__card-footer">
        <div className="task-list__card-dates">
          <div className="task-list__created-at" title="Дата создания">
            <FaRegClock /> {formatDate(task.created_at)}
          </div>
          <div className="task-list__updated-at" title="Обновлено">
            <FaRegClock color="#36a" /> {updatedAgo}
          </div>
          {task.deadline && (
            <div
              className={`task-list__deadline ${
                isTaskOverdue ? 'task-list__deadline--overdue' : ''
              } ${isTaskToday ? 'task-list__deadline--today' : ''}`}
              title="Срок выполнения"
            >
              <FaRegCalendarAlt /> {formatDate(task.deadline)}
            </div>
          )}
        </div>
        {task.comments_count > 0 && (
          <div className="task-list__comments">
            <FaComments /> {task.comments_count}
          </div>
        )}
        {task.responsible && (
          <div className="task-list__responsible">
            <div className="task-list__avatar" title={task.responsible.username}>
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={task.responsible.username}
                  className="task-list__avatar-img"
                  onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              ) : (
                <div className="task-list__avatar-fallback">
                  {task.responsible.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;