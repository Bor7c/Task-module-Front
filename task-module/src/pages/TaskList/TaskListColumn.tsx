import React from 'react';
import TaskCard from './TaskCard';
import { Task } from '../../types/Types';

interface Props {
  status: string;
  tasks: Task[];
  showCompleted: boolean;
  completedStatuses: string[];
  isToday: (date: string) => boolean;
  formatDate: (date: string) => string;
  handleTaskClick: (id: number) => void;
  getProfilePicture: (user: any) => string | null;
}

const TaskListColumn: React.FC<Props> = ({
  status, tasks, showCompleted, completedStatuses, isToday,
  formatDate, handleTaskClick, getProfilePicture
}) => (
  <div className="task-list__column">
    <div className="task-list__column-header">
      <h2>{status}</h2>
      <span className="task-list__column-count">{tasks.length}</span>
    </div>
    <div className="task-list__cards">
      {tasks.length === 0 ? (
        <div className="task-list__empty">
          <p>Нет задач</p>
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            completedStatuses={completedStatuses}
            isToday={isToday}
            formatDate={formatDate}
            handleTaskClick={handleTaskClick}
            getProfilePicture={getProfilePicture}
          />
        ))
      )}
    </div>
  </div>
);

export default TaskListColumn;