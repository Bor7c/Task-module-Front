import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  loadTaskById, 
  addNewComment, 
  removeComment,
  updateTaskStatus,
  updateTaskDescription,
  updateExistingComment,
  updateTaskTitle,
  updateTaskPriority,
  updateTaskResponsible
} from '../../redux/tasksSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { Comment, Task } from '../../types/Task';
import './TaskDetail.css';

const TaskDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTask, loading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isChangingPriority, setIsChangingPriority] = useState(false);
  const [newPriority, setNewPriority] = useState('');
  const [isChangingResponsible, setIsChangingResponsible] = useState(false);
  const [newResponsibleId, setNewResponsibleId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTask) {
      setEditedDescription(currentTask.description || '');
      setEditedTitle(currentTask.title);
      setNewPriority(currentTask.priority);
      setNewResponsibleId(currentTask.responsible?.id || null);
    }
  }, [currentTask]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskStatus({ id: Number(id), status: newStatus })).unwrap();
    } catch (err) {
      console.error('Ошибка при изменении статуса:', err);
    }
  };

  const handleDescriptionSave = async () => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskDescription({ 
        id: Number(id), 
        description: editedDescription 
      })).unwrap();
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Ошибка при сохранении описания:', err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(addNewComment({ 
        taskId: Number(id), 
        text: newComment 
      })).unwrap();
      setNewComment('');
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      try {
        await dispatch(removeComment(commentId)).unwrap();
      } catch (err) {
        console.error('Ошибка при удалении комментария:', err);
      }
    }
  };

  const handleTitleSave = async () => {
    if (!id || !currentTask || !editedTitle.trim()) return;
    try {
      await dispatch(updateTaskTitle({ 
        id: Number(id), 
        title: editedTitle 
      })).unwrap();
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Ошибка при сохранении названия:', err);
    }
  };
  
  const handlePriorityChange = async () => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskPriority({ 
        id: Number(id), 
        priority: newPriority 
      })).unwrap();
      setIsChangingPriority(false);
    } catch (err) {
      console.error('Ошибка при изменении приоритета:', err);
    }
  };
  
  const handleResponsibleChange = async () => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskResponsible({ 
        id: Number(id), 
        responsible_id: newResponsibleId 
      })).unwrap();
      setIsChangingResponsible(false);
    } catch (err) {
      console.error('Ошибка при изменении ответственного:', err);
    }
  };
  
  const handleTakeTask = async () => {
    if (!id || !user || !currentTask) return;
    try {
      await dispatch(updateTaskResponsible({ 
        id: Number(id), 
        responsible_id: user.id 
      })).unwrap();
      await dispatch(updateTaskStatus({ 
        id: Number(id), 
        status: 'assigned' 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при взятии задачи:', err);
    }
  };
  
  const handleReleaseTask = async () => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskResponsible({ 
        id: Number(id), 
        responsible_id: null 
      })).unwrap();
      await dispatch(updateTaskStatus({ 
        id: Number(id), 
        status: 'unassigned' 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при снятии задачи:', err);
    }
  };
  
  const handleMarkSolved = async () => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskStatus({ 
        id: Number(id), 
        status: 'solved' 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при отметке задачи как решенной:', err);
    }
  };
  
  const handleMarkClosed = async () => {
    if (!id || !currentTask) return;
    try {
      await dispatch(updateTaskStatus({ 
        id: Number(id), 
        status: 'closed' 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при закрытии задачи:', err);
    }
  };

  const startCommentEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };

  const saveCommentEdit = async () => {
    if (!editingCommentId) return;
    try {
      await dispatch(updateExistingComment({ 
        id: editingCommentId, 
        text: editedCommentText 
      })).unwrap();
      cancelCommentEdit();
    } catch (err) {
      console.error('Ошибка при сохранении комментария:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ff6b6b';
      case 'high': return '#ffa502';
      case 'medium': return '#2ed573';
      case 'low': return '#70a1ff';
      default: return '#dfe4ea';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return '#ff7f50';
      case 'in_progress': return '#1e90ff';
      case 'solved': return '#2ed573';
      case 'closed': return '#ff4757';
      case 'awaiting_response': return '#ffa502';
      case 'awaiting_action': return '#ffa502';
      default: return '#dfe4ea';
    }
  };

  const renderDescription = () => {
    if (!currentTask) return null;

    if (isEditingDescription) {
      return (
        <div className="description-edit">
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={5}
          />
          <div className="edit-actions">
            <button onClick={handleDescriptionSave} className="save-btn">
              Сохранить
            </button>
            <button 
              onClick={() => setIsEditingDescription(false)} 
              className="cancel-btn"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="task-description">
        <h3>
          Описание
          {user?.id === currentTask.created_by.id && (
            <button 
              onClick={() => setIsEditingDescription(true)}
              className="edit-btn"
              title="Редактировать описание"
            >
              <i className="icon-edit"></i>
            </button>
          )}
        </h3>
        <p>{currentTask.description || 'Нет описания'}</p>
      </div>
    );
  };

  const renderComment = (comment: Comment) => {
    if (editingCommentId === comment.id) {
      return (
        <div key={comment.id} className="comment-edit">
          <textarea
            value={editedCommentText}
            onChange={(e) => setEditedCommentText(e.target.value)}
            rows={3}
            className="comment-edit-textarea"
          />
          <div className="comment-edit-actions">
            <button 
              onClick={saveCommentEdit} 
              className="btn btn-primary btn-sm"
              disabled={!editedCommentText.trim()}
            >
              Сохранить
            </button>
            <button 
              onClick={cancelCommentEdit} 
              className="btn btn-outline-secondary btn-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={comment.id} className={`comment ${comment.is_system ? 'system' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <span className="author-avatar">
              {comment.author.username.charAt(0).toUpperCase()}
            </span>
            <div className="author-info">
              <span className="author-name">{comment.author.username}</span>
              {comment.is_system && <span className="system-tag">Системное</span>}
              <span className="comment-date">
                {new Date(comment.created_at).toLocaleString()}
                {comment.is_modified && ' (изменено)'}
              </span>
            </div>
          </div>
          
          {!comment.is_system && user?.id === comment.author.id && (
            <div className="comment-actions">
              <button
                onClick={() => startCommentEdit(comment)}
                className="btn btn-outline-primary btn-sm"
                title="Редактировать"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="btn btn-outline-danger btn-sm"
                title="Удалить"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          )}
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>
    );
  };

  const renderStatusControls = () => {
    if (!currentTask || !user) return null;
    
    const isCreator = user.id === currentTask.created_by.id;
    const isResponsible = currentTask.responsible?.id === user.id;
    const canEdit = isCreator || isResponsible;
  
    if (currentTask.status === 'unassigned' && !isCreator) {
      return (
        <button 
          onClick={handleTakeTask}
          className="btn btn-primary"
        >
          Взять в работу
        </button>
      );
    }
  
    if (currentTask.status === 'assigned' && isResponsible) {
      return (
        <button 
          onClick={handleReleaseTask}
          className="btn btn-outline-secondary"
        >
          Снять задачу
        </button>
      );
    }
  
    if (['assigned', 'in_progress', 'awaiting_response', 'awaiting_action'].includes(currentTask.status) && isResponsible) {
      return (
        <button 
          onClick={handleMarkSolved}
          className="btn btn-success"
        >
          Отметить как решенное
        </button>
      );
    }
  
    if (currentTask.status === 'solved' && isCreator) {
      return (
        <button 
          onClick={handleMarkClosed}
          className="btn btn-danger"
        >
          Закрыть задачу
        </button>
      );
    }
  
    const statusOptions = [
      { value: 'in_progress', label: 'В работе' },
      { value: 'awaiting_response', label: 'Ожидает ответа' },
      { value: 'awaiting_action', label: 'Ожидает действий' },
    ];
  
    return (
      <div className="status-controls">
        <select
          value={currentTask.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={!canEdit}
          className="form-select"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  const renderTitle = () => {
    if (!currentTask) return null;

    if (isEditingTitle) {
      return (
        <div className="title-edit">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="form-control"
          />
          <div className="edit-actions mt-2">
            <button onClick={handleTitleSave} className="btn btn-primary btn-sm">
              Сохранить
            </button>
            <button 
              onClick={() => setIsEditingTitle(false)} 
              className="btn btn-outline-secondary btn-sm ms-2"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <h1 className="task-title">
        {currentTask.title}
        {user?.id === currentTask.created_by.id && (
          <button 
            onClick={() => setIsEditingTitle(true)}
            className="btn btn-link btn-sm"
            title="Редактировать название"
          >
            <i className="bi bi-pencil"></i>
          </button>
        )}
      </h1>
    );
  };
  
  const renderPriority = () => {
    if (!currentTask) return null;

    if (isChangingPriority) {
      return (
        <div className="priority-edit">
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            className="form-select form-select-sm"
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>
          <div className="edit-actions mt-2">
            <button 
              onClick={handlePriorityChange}
              className="btn btn-primary btn-sm"
            >
              Сохранить
            </button>
            <button 
              onClick={() => setIsChangingPriority(false)}
              className="btn btn-outline-secondary btn-sm ms-2"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <span 
        className="priority-badge"
        style={{ backgroundColor: getPriorityColor(currentTask.priority) }}
        onClick={() => setIsChangingPriority(true)}
      >
        {currentTask.priority_display}
        {user?.id === currentTask.created_by.id && (
          <i className="bi bi-pencil ms-1"></i>
        )}
      </span>
    );
  };

  const renderResponsible = () => {
    if (!currentTask) return null;

    if (!currentTask.responsible) {
      if (isChangingResponsible) {
        return (
          <div className="responsible-edit">
            <input
              type="text"
              placeholder="ID пользователя"
              value={newResponsibleId || ''}
              onChange={(e) => setNewResponsibleId(Number(e.target.value) || null)}
              className="form-control form-control-sm"
            />
            <div className="edit-actions mt-2">
              <button 
                onClick={handleResponsibleChange}
                className="btn btn-primary btn-sm"
              >
                Сохранить
              </button>
              <button 
                onClick={() => setIsChangingResponsible(false)}
                className="btn btn-outline-secondary btn-sm ms-2"
              >
                Отмена
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <span onClick={() => setIsChangingResponsible(true)}>
          Не назначен
          {user?.id === currentTask.created_by.id && (
            <i className="bi bi-pencil ms-1"></i>
          )}
        </span>
      );
    }
    
    if (isChangingResponsible) {
      return (
        <div className="responsible-edit">
          <input
            type="text"
            placeholder="ID пользователя"
            value={newResponsibleId || ''}
            onChange={(e) => setNewResponsibleId(Number(e.target.value) || null)}
            className="form-control form-control-sm"
          />
          <div className="edit-actions mt-2">
            <button 
              onClick={handleResponsibleChange}
              className="btn btn-primary btn-sm"
            >
              Сохранить
            </button>
            <button 
              onClick={() => setIsChangingResponsible(false)}
              className="btn btn-outline-secondary btn-sm ms-2"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <span onClick={() => setIsChangingResponsible(true)}>
        {currentTask.responsible.username}
        {user?.id === currentTask.created_by.id && (
          <i className="bi bi-pencil ms-1"></i>
        )}
      </span>
    );
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Загрузка задачи...</p>
    </div>
  );

  if (error) return <div className="error-message">{error}</div>;
  if (!currentTask) return <div className="not-found">Задача не найдена</div>;

  return (
    <div className="task-detail-page">
      <div className="task-container">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary mb-3">
          <i className="bi bi-arrow-left"></i> Назад к списку
        </button>
        
        <div className="task-header">
          {renderTitle()}
          <div className="task-meta d-flex align-items-center gap-3">
            {renderPriority()}
            {renderStatusControls()}
          </div>
        </div>
        
        <div className="task-content">
          {renderDescription()}
          
          <div className="task-info-grid">
            <div className="info-item">
              <span className="info-label">Создана:</span>
              <span>{new Date(currentTask.created_at).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Автор:</span>
              <span>{currentTask.created_by.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ответственный:</span>
              {renderResponsible()}
            </div>
            {currentTask.deadline && (
              <div className="info-item">
                <span className="info-label">Дедлайн:</span>
                <span>{new Date(currentTask.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="comments-section">
        <div className="section-header">
          <h2>Комментарии</h2>
          <span className="comment-count">{currentTask.comments?.length || 0}</span>
        </div>
        
        <div className="add-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите ваш комментарий здесь..."
            rows={4}
            disabled={isSubmitting}
          />
          <button 
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
            className={isSubmitting ? 'submitting' : ''}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span> Отправка...
              </>
            ) : (
              'Отправить комментарий'
            )}
          </button>
        </div>

        <div className="comments-list">
          {currentTask.comments?.length ? (
            currentTask.comments.map(renderComment)
          ) : (
            <div className="no-comments">
              <i className="icon-comment"></i>
              <p>Пока нет комментариев</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;