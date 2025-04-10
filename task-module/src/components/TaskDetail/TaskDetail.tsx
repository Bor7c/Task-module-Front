import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { loadTaskById, addNewComment, removeComment } from '../../redux/tasksSlice';
import { AppDispatch, RootState } from '../../redux/store';
import './TaskDetail.css';

const TaskDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTask, loading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
  }, [dispatch, id]);

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
      case 'completed': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#dfe4ea';
    }
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
        <button onClick={() => navigate(-1)} className="back-button">
          <i className="icon-arrow-left"></i> Назад к списку
        </button>
        
        <div className="task-header">
          <h1 className="task-title">{currentTask.title}</h1>
          <div className="task-meta">
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(currentTask.priority) }}
            >
              {currentTask.priority_display}
            </span>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(currentTask.status) }}
            >
              {currentTask.status_display}
            </span>
          </div>
        </div>
        
        <div className="task-content">
          <div className="task-description">
            <h3>Описание</h3>
            <p>{currentTask.description || 'Нет описания'}</p>
          </div>
          
          <div className="task-info-grid">
            <div className="info-item">
              <span className="info-label">Создана:</span>
              <span>{new Date(currentTask.created_at).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Автор:</span>
              <span>{currentTask.created_by.username}</span>
            </div>
            {currentTask.responsible && (
              <div className="info-item">
                <span className="info-label">Ответственный:</span>
                <span>{currentTask.responsible.username}</span>
              </div>
            )}
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
            currentTask.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`comment ${comment.is_system ? 'system' : ''}`}
              >
                <div className="comment-header">
                  <div className="comment-author">
                    <span className="author-avatar">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <span className="author-name">{comment.author.username}</span>
                      {comment.is_system && <span className="system-tag">Системное</span>}
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!comment.is_system && user?.id === comment.author.id && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="delete-comment"
                      title="Удалить комментарий"
                    >
                      <i className="icon-trash"></i>
                    </button>
                  )}
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            ))
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