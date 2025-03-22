import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';  // Импортируем типизированные Dispatch и RootState
import { fetchTasks } from '../../redux/tasksSlice';
import './TaskList.css';

const TaskList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();  // Используем типизированный Dispatch
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const status = useSelector((state: RootState) => state.tasks.status);
  const error = useSelector((state: RootState) => state.tasks.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTasks());  // Теперь TypeScript знает тип действия
    }
  }, [status, dispatch]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="task-list">
      <h1>Список задач</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>
              <strong>Статус:</strong> {task.completed ? 'Выполнено' : 'В процессе'}
            </p>
            <p>
              <strong>Создано:</strong> {new Date(task.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;