import React, { useEffect, useState } from 'react';
import { Task } from '../../types/Task';
import { fetchTasks } from '../../api/tasks';
import './TaskList.css';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      }
    };

    loadTasks();
  }, []);

  return (
    <div className="task-list">
      <h1>Список задач</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;