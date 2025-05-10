import React from 'react';
import { FaInbox, FaClipboardCheck } from 'react-icons/fa';

interface Props {
  showCompleted: boolean;
  setShowCompleted: (x: boolean) => void;
  activeCount: number;
  completedCount: number;
  completedOverdueTasks: number;
}

const TaskListTabs: React.FC<Props> = ({
  showCompleted, setShowCompleted, activeCount, completedCount, completedOverdueTasks
}) => (
  <div className="task-list__tabs">
    <button
      className={`task-list__tab ${!showCompleted ? 'task-list__tab--active' : ''}`}
      onClick={() => setShowCompleted(false)}
    >
      <FaInbox /><span>Активные</span>
      <span className="task-list__tab-count">{activeCount}</span>
    </button>
    <button
      className={`task-list__tab ${showCompleted ? 'task-list__tab--active' : ''}`}
      onClick={() => setShowCompleted(true)}
    >
      <FaClipboardCheck /><span>Завершенные</span>
      <span className="task-list__tab-count">
        {completedCount}
        {completedOverdueTasks > 0 && (
          <span className="task-list__tab-overdue-badge" title="Задачи, завершенные с просрочкой">
            {completedOverdueTasks}
          </span>
        )}
      </span>
    </button>
  </div>
);

export default TaskListTabs;