// src/pages/TaskPage/TaskDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { loadTaskById, updateTaskStatus } from '../../redux/taskDetailsSlice';
import { Task } from '../../types/Task';
import LoadingScreen from '../../components/common/LoadingScreen';

const TaskDetail: React.FC = () => {
  const { id } = useParams(); // Получаем ID задачи из параметров маршрута
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Извлекаем состояние из Redux
  const { task, loading, error } = useAppSelector((state) => state.taskDetails);

  // При монтировании компонента, загружаем задачу
  useEffect(() => {
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
  }, [dispatch, id]);

  // Обработчик изменения статуса задачи
  const handleStatusChange = (status: string) => {
    if (task) {
      dispatch(updateTaskStatus({ id: task.id, status }));
    }
  };

  if (loading) {
    return <LoadingScreen fullScreen />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Если задача не загружена
  if (!task) {
    return <div>Задача не найдена</div>;
  }

  return (
    <div className="task-detail">
      <h1>{task.title}</h1>
      <div>
        <strong>Описание:</strong>
        <p>{task.description || 'Нет описания'}</p>
      </div>

      <div>
        <strong>Статус:</strong>
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div>
        <strong>Приоритет:</strong>
        <p>{task.priority}</p>
      </div>

      <div>
        <strong>Ответственный:</strong>
        <p>{task.responsible ? task.responsible.username : 'Не назначено'}</p>
      </div>

      {/* Добавляем кнопку для возврата на страницу с задачами */}
      <button onClick={() => navigate('/')} className="back-button">
        Назад
      </button>
    </div>
  );
};

export default TaskDetail;
