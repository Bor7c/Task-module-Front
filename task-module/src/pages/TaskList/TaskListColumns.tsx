import React from 'react';
import TaskListColumn from './TaskListColumn';
import { Task } from '../../types/Types';

interface Props {
  displayGroups: { [group: string]: Task[] };
  showCompleted: boolean;
  completedStatuses: string[];
  isToday: (date: string) => boolean;
  formatDate: (date: string) => string;
  handleTaskClick: (id: number) => void;
  getProfilePicture: (user: any) => string | null;
}

const TaskListColumns: React.FC<Props> = (props) => (
  <div className="task-list__columns">
    {Object.entries(props.displayGroups).map(([status, statusTasks]) => (
      <TaskListColumn
        key={status}
        status={status}
        tasks={statusTasks}
        showCompleted={props.showCompleted}
        completedStatuses={props.completedStatuses}
        isToday={props.isToday}
        formatDate={props.formatDate}
        handleTaskClick={props.handleTaskClick}
        getProfilePicture={props.getProfilePicture}
      />
    ))}
  </div>
);

export default TaskListColumns;