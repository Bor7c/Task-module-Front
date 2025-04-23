import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  loadTaskById,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskResponsible,
  updateTaskTitle,
  updateTaskDescription,
  addNewComment,
  removeComment,
  updateExistingComment,
  deleteTask
} from '../../redux/tasksSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { Task } from '../../types/Task';
import { User } from '../../types/User';
import TaskComments from './TaskComments/TaskComments';
import TaskPriority from './TaskPriority/TaskPriority';
import TaskStatusControls from './TaskStatusControls/TaskStatusControls';
import LoadingScreen from '../common/LoadingScreen';
import './TaskDetail.css';

const TaskDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentTask, loading, error } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(loadTaskById(Number(id)));
    }
    return () => {
      dispatch({ type: 'tasks/resetUpdateState' });
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTask) {
      setLocalTask(currentTask);
      setEditedTitle(currentTask.title);
    }
  }, [currentTask]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !localTask) return;
    
    try {
      await dispatch(updateTaskStatus({ 
        id: Number(id), 
        status: newStatus 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при изменении статуса:', err);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    if (!id) return;
    
    try {
      await dispatch(updateTaskPriority({ 
        id: Number(id), 
        priority 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при изменении приоритета:', err);
    }
  };
  
  const handleResponsibleChange = async (responsibleId: number | null) => {
    if (!id) return;
    
    try {
      await dispatch(updateTaskResponsible({ 
        id: Number(id), 
        responsible_id: responsibleId 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при изменении ответственного:', err);
    }
  };
  
  const handleDeleteTask = async () => {
    if (!id) return;
    if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
      try {
        await dispatch(deleteTask(Number(id))).unwrap();
        navigate('/tasks');
      } catch (err) {
        console.error('Ошибка при удалении задачи:', err);
      }
    }
  };

  const handleTitleSave = async () => {
    if (!id || !editedTitle.trim()) return;
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

  const handleAddComment = async (text: string) => {
    if (!id || !localTask) return;
    
    try {
      await dispatch(addNewComment({ 
        taskId: Number(id), 
        text 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при добавлении комментария:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!localTask) return;
    
    try {
      await dispatch(removeComment(commentId)).unwrap();
    } catch (err) {
      console.error('Ошибка при удалении комментария:', err);
    }
  };

  const handleEditComment = async (commentId: number, text: string) => {
    if (!localTask) return;
    
    try {
      await dispatch(updateExistingComment({ 
        id: commentId, 
        text 
      })).unwrap();
    } catch (err) {
      console.error('Ошибка при сохранении комментария:', err);
    }
  };

  if (loading && !localTask) return <LoadingScreen />;
  if (error) return <div className="error-message">{error}</div>;
  if (!localTask) return <div className="not-found">Задача не найдена</div>;

  return (
    <div className="task-detail-container">
      <div className="task-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← Назад к списку
        </button>
        
        <div className="title-section">
          {isEditingTitle ? (
            <div className="title-edit">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="title-input"
                autoFocus
              />
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleTitleSave}
                >
                  Сохранить
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditingTitle(false)}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <h1 className="task-title">
              {localTask.title}
              {user?.id === localTask.created_by.id && (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditingTitle(true)}
                >
                  ✏️
                </button>
              )}
            </h1>
          )}
          
          {user?.id === localTask.created_by.id && (
            <button 
              className="delete-btn"
              onClick={handleDeleteTask}
            >
              Удалить задачу
            </button>
          )}
        </div>
      </div>

      <div className="task-grid">
        {/* Блок статуса и приоритета */}
        <div className="task-card status-card">
          <h3>Состояние задачи</h3>
          <TaskStatusControls
            task={localTask}
            user={user}
            onStatusChange={handleStatusChange}
            onTakeTask={() => handleResponsibleChange(user?.id || null)}
            onReleaseTask={() => handleResponsibleChange(null)}
            onMarkSolved={() => handleStatusChange('solved')}
            onMarkClosed={() => handleStatusChange('closed')}
          />
          <TaskPriority 
            task={localTask}
            user={user}
            onPriorityChange={handlePriorityChange}
          />
        </div>

        {/* Блок информации */}
        <div className="task-card info-card">
          <h3>Информация</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Создана:</span>
              <span>{formatDate(localTask.created_at)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Обновлена:</span>
              <span>{formatDate(localTask.updated_at)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Создатель:</span>
              <span>{localTask.created_by.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ответственный:</span>
              <span className="responsible-info">
                {localTask.responsible ? (
                  <>
                    <span className="responsible-name">
                      {localTask.responsible.username}
                    </span>
                    <span className="responsible-role">
                      ({localTask.responsible.role_display})
                    </span>
                  </>
                ) : 'Не назначен'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Комментарии:</span>
              <span>{localTask.comments_count}</span>
            </div>
          </div>
        </div>

        {/* Блок описания */}
        <div className="task-card description-card">
          <div className="description-header">
            <h3>Описание</h3>
            {user?.id === localTask.created_by.id && (
              <button className="edit-btn">
                Редактировать
              </button>
            )}
          </div>
          <div className="description-content">
            {localTask.description || (
              <p className="no-description">Нет описания</p>
            )}
          </div>
        </div>
      </div>

      {/* Комментарии */}
      <div className="comments-section">
        <TaskComments 
          task={localTask} 
          user={user}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onEditComment={handleEditComment}
        />
      </div>
    </div>
  );
};

export default TaskDetail;