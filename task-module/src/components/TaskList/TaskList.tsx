// src/components/TaskList/TaskList.tsx
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { loadTasks } from '../../redux/tasksSlice';
import './TaskList.css';

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  if (loading) {
    return <div>Загрузка задач...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className="task-item">
          <h3>{task.title}</h3>
          <p>Статус: {task.status}</p>
        </div>
      ))}
    </div>
  );
};

export default TaskList;