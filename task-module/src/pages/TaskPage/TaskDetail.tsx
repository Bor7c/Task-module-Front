import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import {
  loadTaskById,
  updateTaskStatus,
  updateTaskPriority,
  assignTaskResponsible,
  removeResponsible,
  updateTaskTitle,
  updateTaskDescription,
} from '../../redux/taskDetailsSlice';
import { setUsers, setLoading, setError } from '../../redux/usersSlice';
import { Task, User, Comment } from '../../types/Types';
import LoadingScreen from '../../components/common/LoadingScreen';
import { fetchUsers } from '../../api/users';
import { fetchComments, addComment } from '../../api/commentsApi';
import './TaskDetail.css';

type TaskStatus = 'in_progress' | 'solved' | 'closed' | 'awaiting_response' | 'awaiting_action';

const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { task, loading, error } = useAppSelector((state) => state.taskDetails);
  const { users } = useAppSelector((state) => state.users);
  const currentUser = useAppSelector((state) => state.auth.user);
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>('awaiting_action');

  // Загружаем пользователей
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

  // Загружаем задачу
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
  }, [dispatch, id, currentUser, navigate]);

  // Загружаем комментарии задачи
  useEffect(() => {
    if (id) {
      fetchComments(Number(id))
        .then((data) => setComments(data))
        .catch(() => dispatch(setError('Ошибка загрузки комментариев')));
    }
  }, [id]);

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
      setLocalStatus(status);
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
      addComment(task.id, newComment.trim())
        .then(() => {
          setNewComment('');
          fetchComments(task.id).then((data) => setComments(data)); // Перезагружаем комментарии
        })
        .catch(() => dispatch(setError('Ошибка добавления комментария')));
    }
  };

  const handleSaveTask = () => {
    if (task && (editedTitle !== task.title || editedDescription !== task.description)) {
      // Сохраняем изменения задачи
      if (editedTitle !== task.title) {
        dispatch(updateTaskTitle({ id: task.id, title: editedTitle })).then(() => {
          // После успешного обновления, мы можем обновить состояние задачи в редуксе
          if (task && task.id) {
            dispatch(loadTaskById(task.id));  // Перезагружаем задачу с актуальными данными
          }
        });
      }
      if (editedDescription !== task.description) {
        dispatch(updateTaskDescription({ id: task.id, description: editedDescription })).then(() => {
          // После успешного обновления, мы можем обновить состояние задачи в редуксе
          if (task && task.id) {
            dispatch(loadTaskById(task.id));  // Перезагружаем задачу с актуальными данными
          }
        });
      }
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

  if (loading && !task) return <LoadingScreen fullScreen />;
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
          <p>{readableStatus(localStatus)}</p>
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
                Назначить на меня
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
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
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
