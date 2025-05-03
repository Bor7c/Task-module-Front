import React, { useEffect, useState, useRef } from 'react';
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
import { fetchUsers } from '../../api/users';
import { FaEdit, FaTrash, FaSave, FaUserPlus, FaArrowLeft, FaRegClock, FaSync, FaExclamationCircle } from 'react-icons/fa';
import LoadingScreen from '../../components/common/LoadingScreen';
import { Task, User, Comment } from '../../types/Types';
import './TaskDetail.css';
import TaskAttachments from '../../components/TaskAttachments/TaskAttachments';

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
  const [localPriority, setLocalPriority] = useState('medium');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [isAwaitingMenuOpen, setIsAwaitingMenuOpen] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  
  const awaitingMenuRef = useRef<HTMLDivElement>(null);
  const closeConfirmationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (awaitingMenuRef.current && !awaitingMenuRef.current.contains(event.target as Node)) {
        setIsAwaitingMenuOpen(false);
      }
      if (closeConfirmationRef.current && !closeConfirmationRef.current.contains(event.target as Node)) {
        setShowCloseConfirmation(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
      setLocalPriority(task.priority);
    }
  }, [task]);

  const handleStatusChange = (status: TaskStatus) => {
    if (task) {
      if (status === 'closed') {
        setShowCloseConfirmation(true);
      } else {
        dispatch(updateTaskStatus({ id: task.id, status }))
          .then(() => {
            setLocalStatus(status);
            dispatch(loadTaskById(Number(id)));
          });
        setIsAwaitingMenuOpen(false);
      }
    }
  };

  const confirmCloseTask = () => {
    if (task) {
      dispatch(updateTaskStatus({ id: task.id, status: 'closed' }))
        .then(() => {
          setLocalStatus('closed');
          dispatch(loadTaskById(Number(id)));
        });
      setShowCloseConfirmation(false);
    }
  };

  const cancelCloseTask = () => {
    setShowCloseConfirmation(false);
  };

  const handlePriorityChange = (priority: string) => {
    if (task) {
      setLocalPriority(priority);
      dispatch(updateTaskPriority({ id: task.id, priority }))
        .then(() => dispatch(loadTaskById(Number(id))));
    }
  };

  const handleAssignResponsible = (userId: number) => {
    if (task) {
      dispatch(assignTaskResponsible({ id: task.id, responsible_id: userId }))
        .then(() => dispatch(loadTaskById(Number(id))));
    }
  };

  const handleRemoveResponsible = () => {
    if (task) {
      dispatch(removeResponsible(task.id))
        .then(() => dispatch(loadTaskById(Number(id))));
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress': return 'task-detail__status-in-progress';
      case 'solved': return 'task-detail__status-solved';
      case 'closed': return 'task-detail__status-closed';
      case 'awaiting_response': return 'task-detail__status-awaiting-response';
      case 'awaiting_action': return 'task-detail__status-awaiting-action';
      default: return '';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'task-detail__priority-low';
      case 'medium': return 'task-detail__priority-medium';
      case 'high': return 'task-detail__priority-high';
      case 'critical': return 'task-detail__priority-critical';
      default: return '';
    }
  };

  const readableStatus = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress': return 'В работе';
      case 'solved': return 'Решено';
      case 'closed': return 'Закрыто';
      case 'awaiting_response': return 'Ожидает ответа';
      case 'awaiting_action': return 'Ожидает действий';
      default: return 'Неизвестно';
    }
  };

  if (loading && !task) return <LoadingScreen fullScreen />;
  if (error) return <div className="task-detail__error">{error}</div>;
  if (!task) return <div className="task-detail__not-found">Задача не найдена</div>;

  return (
    <div className="task-detail-container">
      <div className="task-detail__header">
        <button onClick={() => navigate('/tasks')} className="task-detail__back-btn">
          <FaArrowLeft /> Назад
        </button>
        
        <div className="task-detail__action-buttons">
          {/* В работу */}
          {localStatus !== 'in_progress' && localStatus !== 'closed' && (
            <button 
              onClick={() => handleStatusChange('in_progress')} 
              className="task-detail__status-btn task-detail__in-progress-btn"
            >
              {localStatus === 'solved' ? 'Возобновить работу' : 'Взять в работу'}
            </button>
          )}
          
          {/* Ожидание с выпадающим меню */}
          {localStatus !== 'closed' && (
            <div className="task-detail__dropdown-container" ref={awaitingMenuRef}>
              <button 
                onClick={() => setIsAwaitingMenuOpen(!isAwaitingMenuOpen)} 
                className="task-detail__status-btn task-detail__awaiting-btn"
              >
                Ожидание
              </button>
              {isAwaitingMenuOpen && (
                <div className="task-detail__dropdown-menu">
                  <button 
                    onClick={() => handleStatusChange('awaiting_action')} 
                    className="task-detail__dropdown-item"
                  >
                    Ожидает действий
                  </button>
                  <button 
                    onClick={() => handleStatusChange('awaiting_response')} 
                    className="task-detail__dropdown-item"
                  >
                    Ожидает ответа
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Решено / Закрыть */}
          {localStatus !== 'solved' && localStatus !== 'closed' && (
            <button 
              onClick={() => handleStatusChange('solved')} 
              className="task-detail__status-btn task-detail__solved-btn"
            >
              Решено
            </button>
          )}
          
          {localStatus === 'solved' && (
            <button 
              onClick={() => handleStatusChange('closed')} 
              className="task-detail__status-btn task-detail__closed-btn"
            >
              Закрыть
            </button>
          )}
        </div>
      </div>
      
      {/* Модальное окно подтверждения закрытия */}
      {showCloseConfirmation && (
        <div className="task-detail__modal-overlay">
          <div className="task-detail__modal-dialog" ref={closeConfirmationRef}>
            <h3>Подтверждение закрытия</h3>
            <p>Вы уверены, что хотите закрыть задачу? Это действие нельзя будет отменить.</p>
            <div className="task-detail__modal-actions">
              <button onClick={cancelCloseTask} className="task-detail__modal-cancel">Отмена</button>
              <button onClick={confirmCloseTask} className="task-detail__modal-confirm">Подтвердить</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="task-detail__content">
        <div className="task-detail__left-column">
          <div className="task-detail__title-container">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Название задачи"
                className="task-detail__title-input"
                disabled={currentUser?.id !== task.created_by.id}
              />
            ) : (
              <div className="task-detail__title-wrapper">
                <h1 className="task-detail__title">
                  {task.title}
                  {currentUser?.id === task.created_by.id && (
                    <button onClick={() => setIsEditing(true)} className="task-detail__edit-title-btn">
                      <FaEdit />
                    </button>
                  )}
                </h1>
                {task.is_overdue && (
                  <div className="task-detail__overdue-badge">
                    <FaExclamationCircle /> Просрочена
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="task-detail__description-container">
            {isEditing ? (
              <div className="task-detail__edit-container">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Описание задачи"
                  className="task-detail__description-textarea"
                  disabled={currentUser?.id !== task.created_by.id}
                />
                
                {currentUser?.id === task.created_by.id && (
                  <div className="task-detail__edit-actions">
                    <button onClick={handleSaveTask} className="task-detail__save-btn">
                      <FaSave /> Сохранить
                    </button>
                    <button onClick={() => setIsEditing(false)} className="task-detail__cancel-btn">
                      Отмена
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="task-detail__description">
                <h3>Описание:</h3>
                <p className="task-detail__description-text">{task.description || '👉 Нет описания'}</p>
                {currentUser?.id === task.created_by.id && (
                  <button onClick={() => setIsEditing(true)} className="task-detail__edit-description-btn">
                    <FaEdit /> Редактировать
                  </button>
                )}
              </div>
            )}
          </div>

          <TaskAttachments taskId={task.id} />
          
          {/* Комментарии */}
          <div className="task-detail__comment-section">
            <h2>Комментарии ({comments.filter(comment => !comment.is_deleted).length})</h2>
            <div className="task-detail__add-comment">
              <textarea
                placeholder="Добавить комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="task-detail__comment-textarea"
              />
              <button 
                onClick={handleAddComment} 
                className="task-detail__comment-btn"
                disabled={!newComment.trim()}
              >
                Добавить комментарий
              </button>
            </div>
            
            <div className="task-detail__comments-list">
              {comments
                .filter(comment => !comment.is_deleted)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((comment) => (
                  <div key={comment.id} className="task-detail__comment-card">
                    <div className="task-detail__comment-header">
                      <div className="task-detail__comment-author">
                        <p className="task-detail__author-name">{comment.author.username}</p>
                        <p className="task-detail__comment-meta">
                          {comment.is_modified && !comment.is_system && 
                            <span className="task-detail__modified-badge">изменен</span>
                          }
                          <span className="task-detail__comment-date">{formatDate(comment.updated_at)}</span>
                        </p>
                      </div>
                      {comment.author.id === currentUser?.id && (
                        <div className="task-detail__comment-actions">
                          <button onClick={() => handleEditComment(comment)} className="task-detail__edit-comment-btn">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteComment(comment.id)} className="task-detail__delete-comment-btn">
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="task-detail__comment-body">
                      {editingCommentId === comment.id ? (
                        <>
                          <textarea
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            className="task-detail__edit-comment-textarea"
                          />
                          <button onClick={handleSaveComment} className="task-detail__save-comment-btn">
                            <FaSave /> Сохранить
                          </button>
                        </>
                      ) : (
                        <p>{comment.text}</p>
                      )}
                    </div>
                  </div>
                ))}
              {comments.filter(comment => !comment.is_deleted).length === 0 && (
                <p className="task-detail__no-comments">Нет комментариев</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="task-detail__right-column">
          <div className="task-detail__info-card">
            <div className="task-detail__info-section">
              <h3>Статус</h3>
              <div className={`task-detail__status-badge ${getStatusClass(localStatus)}`}>
                {readableStatus(localStatus)}
              </div>
              {task.updated_at && (
                <p className="task-detail__timestamp">
                  <FaRegClock /> Обновлено: {formatDate(task.updated_at)}
                </p>
              )}
            </div>
            
            <div className="task-detail__info-section">
              <h3>Приоритет</h3>
              <div className="task-detail__priority-selector">
                <select
                  value={localPriority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className={`task-detail__priority-select ${getPriorityClass(localPriority)}`}
                  disabled={localStatus === 'closed'}
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критический</option>
                </select>
              </div>
            </div>
            
            <div className="task-detail__info-section">
              <h3>Ответственный</h3>
              <div className="task-detail__responsible-info">
                <div className="task-detail__responsible-controls">
                  {task.responsible && (
                    <button 
                      onClick={handleRemoveResponsible} 
                      className="task-detail__remove-responsible-btn"
                      title="Снять ответственного"
                      disabled={localStatus === 'closed'}
                    >
                      Снять
                    </button>
                  )}
                  
                  <select
                    onChange={(e) => handleAssignResponsible(Number(e.target.value))}
                    value={task.responsible?.id || ''}
                    className="task-detail__user-select"
                    disabled={localStatus === 'closed'}
                  >
                    <option value="">{task.responsible ? task.responsible.username : "Не назначен"}</option>
                    {users.map((user: User) => (
                      user.id !== task.responsible?.id && (
                        <option key={user.id} value={user.id}>
                          {user.username}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={() => handleAssignResponsible(currentUser?.id || 0)} 
                  className="task-detail__assign-btn"
                  disabled={currentUser?.id === task.responsible?.id || localStatus === 'closed'}
                >
                  <FaUserPlus /> Назначить на меня
                </button>
              </div>
            </div>
            
            <div className="task-detail__info-section">
              <h3>Информация о задаче</h3>
              <div className="task-detail__additional-info">
                <p><strong>Создана:</strong> {formatDate(task.created_at)}</p>
                <p><strong>Автор:</strong> {task.created_by.username}</p>
                {task.deadline && (
                  <p className={task.is_overdue ? 'task-detail__overdue-text' : ''}>
                    <strong>Срок выполнения:</strong> {formatDate(task.deadline)}
                  </p>
                )}
                {task.closed_at && (
                  <p className={task.is_overdue ? 'task-detail__late-closed' : 'task-detail__on-time-closed'}>
                    <strong>Закрыта:</strong> {formatDate(task.closed_at)}
                  </p>
                )}
                {task.is_overdue && task.status === 'closed' && (
                  <p className="task-detail__overdue-note">
                    <FaExclamationCircle /> Задача была закрыта после срока выполнения
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;