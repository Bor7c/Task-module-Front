import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  loadTaskById,
  updateTaskStatus,
  updateTaskPriority,
  assignTaskResponsible,
  removeResponsible,
} from '../../redux/taskDetailsSlice';
import { setUsers, setLoading, setError } from '../../redux/usersSlice';
import { Task, User } from '../../types/Types';
import LoadingScreen from '../../components/common/LoadingScreen';
import { fetchUsers } from '../../api/users';
import './TaskDetail.css';

type TaskStatus = 'in_progress' | 'solved' | 'closed' | 'awaiting_response' | 'awaiting_action';

const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { task, loading, error } = useAppSelector((state) => state.taskDetails);
  const { users } = useAppSelector((state) => state.users);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>('awaiting_action');

  // Загружаем ТОЛЬКО пользователей
  useEffect(() => {
    if (users.length === 0) {
      dispatch(setLoading(true));
      fetchUsers()
        .then((data) => {
          dispatch(setUsers(data));
          dispatch(setLoading(false));
        })
        .catch(() => {
          dispatch(setError('Ошибка загрузки пользователей'));
          dispatch(setLoading(false));
        });
    }
  }, [dispatch, users.length]);

  // Загружаем ТОЛЬКО задачу
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
  }, [dispatch, id, currentUser, navigate]);

  // Когда задача загружена — заполняем поля
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setLocalStatus(task.status); // Обновляем локальный статус при загрузке задачи
    }
  }, [task]);

  const handleStatusChange = (status: TaskStatus) => {
    if (task) {
      // Сначала обновляем локально
      setLocalStatus(status);

      // Отправляем изменение на сервер
      dispatch(updateTaskStatus({ id: task.id, status }));
    }
  };

  const handlePriorityChange = (priority: string) => {
    if (task) {
      dispatch(updateTaskPriority({ id: task.id, priority }));
    }
  };

  const handleAssignResponsible = (userId: number) => {
    if (task) {
      dispatch(assignTaskResponsible({ id: task.id, responsible_id: userId }));
    }
  };

  const handleRemoveResponsible = () => {
    if (task) {
      dispatch(removeResponsible(task.id));
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() && task) {
      // Здесь можно будет отправить комментарий на сервер
      setNewComment('');
    }
  };

  const handleSaveTask = () => {
    if (task && (editedTitle !== task.title || editedDescription !== task.description)) {
      // Сохраняем изменения задачи
    }
    setIsEditing(false);
  };

  const readableStatus = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
        return 'В работе';
      case 'solved':
        return 'Решен';
      case 'closed':
        return 'Закрыт';
      case 'awaiting_response':
        return 'Ожидает ответа';
      case 'awaiting_action':
        return 'Ожидает действий';
      default:
        return 'Неизвестный статус';
    }
  };

  if (loading && !task) return <LoadingScreen fullScreen />; // только при полном отсутствии задачи
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!task) return <div className="text-center mt-10 text-gray-500">Задача не найдена</div>;

  const isAdminOrOwner = currentUser?.role === 'admin' || currentUser?.id === task.created_by.id;

  return (
    <div className="task-detail-container">
      <h1 className="task-title">{task.title}</h1>

      {isEditing ? (
        <div className="edit-task-inputs">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Название задачи"
            className="input-field"
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Описание задачи"
            className="input-field"
          />
          <button onClick={handleSaveTask} className="save-task-btn">
            Сохранить
          </button>
        </div>
      ) : (
        <div className="task-description">
          <p><strong>Описание:</strong> {task.description || 'Нет описания'}</p>
          {isAdminOrOwner && (
            <button onClick={() => setIsEditing(true)} className="edit-task-btn">
              Редактировать
            </button>
          )}
        </div>
      )}

      <div className="task-status-priority-container">
        <div>
          <strong>Статус:</strong>
          <p>{readableStatus(localStatus)}</p> {/* Используем локальное состояние для отображения */}
          {/* Статус может быть изменен всеми пользователями */}
          <div className="status-buttons">
            {localStatus !== 'in_progress' && (
              <button onClick={() => handleStatusChange('in_progress')} className="status-btn">
                Взять в работу
              </button>
            )}
            {localStatus !== 'awaiting_response' && (
              <button onClick={() => handleStatusChange('awaiting_response')} className="status-btn">
                Ожидает ответа
              </button>
            )}
            {localStatus !== 'awaiting_action' && (
              <button onClick={() => handleStatusChange('awaiting_action')} className="status-btn">
                Ожидает действий
              </button>
            )}
          </div>
        </div>

        <div>
          <strong>Приоритет:</strong>
          <select
            defaultValue={task.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="task-select"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>
        </div>

        <div>
          <strong>Ответственный:</strong>
          {task.responsible ? (
            <div className="assigned-responsible">
              <p>{task.responsible.username}</p>
              {/* Ответственного можно удалить только администратору или создателю задачи */}
              {isAdminOrOwner && (
                <button
                  onClick={handleRemoveResponsible}
                  className="remove-responsible-btn"
                >
                  Снять
                </button>
              )}
            </div>
          ) : (
            <div className="assign-responsible-container">
              <select
                onChange={(e) => handleAssignResponsible(Number(e.target.value))}
                className="task-select"
              >
                <option value="">Выбрать пользователя</option>
                {users.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleAssignResponsible(currentUser?.id || 0)}
                className="assign-responsible-btn"
              >
                Назначить себя
              </button>
            </div>
          )}
        </div>

        <div className="comment-section">
          <strong>Комментарии:</strong>
          <textarea
            placeholder="Добавить комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field"
          />
          <button
            onClick={handleAddComment}
            className="comment-btn"
          >
            Добавить комментарий
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="back-btn"
      >
        Назад
      </button>
    </div>
  );
};

export default TaskDetail;
