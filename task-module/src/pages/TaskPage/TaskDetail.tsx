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
  addComment,
  loadComments,
  updateComment,
  removeComment
} from '../../redux/taskDetailsSlice';
import { setUsers, setLoading, setError } from '../../redux/usersSlice';
import { Task, User, Comment } from '../../types/Types';
import LoadingScreen from '../../components/common/LoadingScreen';
import { fetchUsers } from '../../api/users';
import './TaskDetail.css';
import { FaEdit, FaTrash, FaSave, FaUserPlus } from 'react-icons/fa';

type TaskStatus = 'in_progress' | 'solved' | 'closed' | 'awaiting_response' | 'awaiting_action';

const TaskDetail: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { task, loading, error, comments } = useAppSelector((state) => state.taskDetails);
  const { users } = useAppSelector((state) => state.users);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>('awaiting_action');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');

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

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(loadTaskById(Number(id)));
      dispatch(loadComments(Number(id)));
    }
  }, [dispatch, id, currentUser, navigate]);

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setLocalStatus(task.status);
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
    if (task && userId) {
      dispatch(assignTaskResponsible({ id: task.id, responsible_id: userId }));
    }
  };

  const handleRemoveResponsible = () => {
    if (task) {
      dispatch(removeResponsible(task.id));
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && task) {
      try {
        await dispatch(addComment({ taskId: task.id, text: newComment.trim() }));
        setNewComment('');
        dispatch(loadComments(task.id));
      } catch {
        dispatch(setError('Ошибка добавления комментария'));
      }
    }
  };

  const handleSaveTask = async () => {
    if (task && (editedTitle !== task.title || editedDescription !== task.description)) {
      try {
        if (editedTitle !== task.title) {
          await dispatch(updateTaskTitle({ id: task.id, title: editedTitle }));
        }
        if (editedDescription !== task.description) {
          await dispatch(updateTaskDescription({ id: task.id, description: editedDescription }));
        }
        dispatch(loadTaskById(task.id));
      } catch {
        dispatch(setError('Ошибка обновления задачи'));
      }
    }
    setIsEditing(false);
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const handleSaveComment = async () => {
    if (editingCommentId && editedCommentText.trim()) {
      try {
        await dispatch(updateComment({ id: editingCommentId, text: editedCommentText }));
        setEditingCommentId(null);
        setEditedCommentText('');
        if (task) {
          dispatch(loadComments(task.id));
        }
      } catch {
        dispatch(setError('Ошибка обновления комментария'));
      }
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (task) {
      dispatch(removeComment(commentId))
        .then(() => dispatch(loadComments(task.id)))
        .catch(() => dispatch(setError('Ошибка удаления комментария')));
    }
  };

  const readableStatus = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress': return 'В работе';
      case 'solved': return 'Решен';
      case 'closed': return 'Закрыт';
      case 'awaiting_response': return 'Ожидает ответа';
      case 'awaiting_action': return 'Ожидает действий';
      default: return 'Неизвестный статус';
    }
  };

  if (loading && !task) return <LoadingScreen fullScreen />;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (!task) return <div className="text-center mt-10 text-gray-500">Задача не найдена</div>;

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
            disabled={currentUser?.id !== task.created_by.id}
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Описание задачи"
            className="input-field"
            disabled={currentUser?.id !== task.created_by.id}
          />
          {currentUser?.id === task.created_by.id && (
            <button onClick={handleSaveTask} className="save-task-btn">
              <FaSave /> Сохранить
            </button>
          )}
        </div>
      ) : (
        <div className="task-description">
          <p><strong>Описание:</strong> {task.description || 'Нет описания'}</p>
          {currentUser?.id === task.created_by.id && (
            <button onClick={() => setIsEditing(true)} className="edit-task-btn">
              <FaEdit /> Редактировать
            </button>
          )}
        </div>
      )}

      <div className="task-status-priority-container">
        <div>
          <strong>Статус:</strong>
          <p>{readableStatus(localStatus)}</p>
          {task.updated_at && <p className="status-updated">Изменено: {new Date(task.updated_at).toLocaleString()}</p>}
          <div className="status-buttons">
            {localStatus !== 'in_progress' && (
              <button onClick={() => handleStatusChange('in_progress')} className="status-btn">Взять в работу</button>
            )}
            {localStatus !== 'awaiting_response' && (
              <button onClick={() => handleStatusChange('awaiting_response')} className="status-btn">Ожидает ответа</button>
            )}
            {localStatus !== 'awaiting_action' && (
              <button onClick={() => handleStatusChange('awaiting_action')} className="status-btn">Ожидает действий</button>
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
              <button onClick={handleRemoveResponsible} className="remove-responsible-btn">
                Снять
              </button>
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
              <button onClick={() => handleAssignResponsible(currentUser?.id || 0)} className="assign-responsible-btn">
                <FaUserPlus /> Назначить на меня
              </button>
            </div>
          )}
        </div>
      </div>

    <div className="comment-section">
        <strong>Комментарии:</strong>
        <textarea
            placeholder="Добавить комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field"
        />
        <button onClick={handleAddComment} className="comment-btn">Добавить комментарий</button>
        <div className="comments-list">
            {comments.map((comment) => (
            <div key={comment.id} className="comment-card">
                {/* Шапочка комментария */}
                <div className="comment-header">
                <div className="comment-author-info">
                    <p><strong>{comment.author.username}</strong></p>
                    <p className="comment-date">{new Date(comment.updated_at).toLocaleString()}</p>
                </div>
                {/* Кнопки для редактирования и удаления только для автора комментария */}
                {comment.author.id === currentUser?.id && (
                    <div className="comment-actions">
                    <button onClick={() => handleEditComment(comment)} className="edit-comment-btn">
                        <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteComment(comment.id)} className="delete-comment-btn">
                        <FaTrash />
                    </button>
                    </div>
                )}
                </div>
                
                {/* Тело комментария */}
                <div className="comment-body">
                {editingCommentId === comment.id ? (
                    <>
                    <textarea
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleSaveComment} className="save-comment-btn">
                        <FaSave /> Сохранить
                    </button>
                    </>
                ) : (
                    <p>{comment.text}</p>
                )}
                </div>
            </div>
            ))}
        </div>
        </div>


      <button onClick={() => navigate('/')} className="back-btn">
        Назад
      </button>
    </div>
  );
};

export default TaskDetail;
