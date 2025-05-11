import React from 'react';
import { FaSyncAlt, FaPlus } from 'react-icons/fa';

interface Props {
  totalTasks: number;
  activeCount: number;
  completedOverdueTasks: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  user: any;
  onCreateTask: () => void;
}

const TaskListHeader: React.FC<Props> = ({
  totalTasks, activeCount, completedOverdueTasks, isRefreshing, onRefresh, user, onCreateTask
}) => (
  <div className="task-list__header">
    <div className="task-list__title">
      <h1>
        Задачи моих команд
        <span className="task-list__counts-inline">
          (всего: {totalTasks}, активных: {activeCount})
          {completedOverdueTasks > 0 && (
            <span className="task-list__overdue-completed-badge">
              {completedOverdueTasks} завершено с просрочкой
            </span>
          )}
        </span>
      </h1>
      <div className="task-list__actions">
        <button
          className={`task-list__refresh-btn ${isRefreshing ? 'task-list__refresh-btn--rotating' : ''}`}
          onClick={onRefresh}
          aria-label="Обновить задачи"
          title="Обновить задачи"
        >
          <FaSyncAlt />
        </button>
        {user && (
          <button
            className="task-list__create-btn"
            onClick={onCreateTask}
            aria-label="Создать задачу"
          >
            <FaPlus /> <span>Создать задачу</span>
          </button>
        )}
      </div>
    </div>
  </div>
);

export default TaskListHeader;