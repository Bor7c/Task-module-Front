import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { loadTasks } from '../../redux/tasksSlice';
import { Task } from '../../types/Task';
import { AppDispatch, RootState } from '../../redux/store'; // Импортируем типы
import './TaskList.css';

const TaskList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Типизируем dispatch
  const { tasks, loading, error } = useSelector((state: RootState) => state.tasks); // Типизируем state

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="task-list">
      <h1>Список задач</h1>
      <ul>
        {tasks.map((task: Task) => (
          <li key={task.id}>
            <Link to={`/tasks/${task.id}`}>{task.title}</Link>
            <span> ({task.status})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;