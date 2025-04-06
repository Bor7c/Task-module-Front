import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { loadTaskById } from '../../redux/tasksSlice';
import { Task, Comment } from '../../types/Task';
import { AppDispatch, RootState } from '../../redux/store'; // Импортируем типы
import './TaskDetail.css';


const TaskDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Типизируем dispatch
  const { id } = useParams<{ id: string }>();
  const { currentTask, loading, error } = useSelector((state: RootState) => state.tasks); // Типизируем state

  useEffect(() => {
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
  }, [dispatch, id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!currentTask) return <div>Задача не найдена</div>;

  return (
    <div className="task-detail">
      <h1>{currentTask.title}</h1>
      <p>{currentTask.description}</p>
      <p>Статус: {currentTask.status}</p>
      <h2>Комментарии</h2>
      <ul>
        {currentTask.comments?.map((comment: Comment) => (
          <li key={comment.id}>
            <p>{comment.text}</p>
            <small>{new Date(comment.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskDetail;