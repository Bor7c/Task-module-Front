import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { loadTasks } from '../../redux/tasksSlice';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/Task';
import './TaskList.css';

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadTasks());
  }, [dispatch]);

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate('/tasks/new');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'var(--priority-critical)';
      case 'high': return 'var(--priority-high)';
      case 'medium': return 'var(--priority-medium)';
      case 'low': return 'var(--priority-low)';
      default: return 'var(--priority-default)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'var(--status-in-progress)';
      case 'solved': return 'var(--status-solved)';
      case 'closed': return 'var(--status-closed)';
      case 'unassigned': return 'var(--status-unassigned)';
      case 'awaiting_response': return 'var(--status-awaiting)';
      case 'awaiting_action': return 'var(--status-awaiting)';
      default: return 'var(--status-default)';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка задач...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="task-list-container">
      <div className="list-header">
        <h2 className="list-title">Список задач</h2>
        <p>Управляйте своими задачами эффективно и просто</p>
        {user && (
          <button onClick={handleCreateTask} className="create-task-btn">
            <i className="icon-plus"></i> Создать задачу
          </button>
        )}
      </div>
      
      {tasks.length === 0 ? (
        <div className="empty-state">
          <i className="icon-tasks"></i>
          <p>Нет доступных задач</p>
          {user && (
            <button onClick={handleCreateTask} className="create-task-btn">
              Создать первую задачу
            </button>
          )}
        </div>
      ) : (
        <div className="task-grid">
          {tasks.map((task: Task) => (
            <div 
              key={task.id} 
              className="task-card"
              onClick={() => handleTaskClick(task.id)}
            >
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <div className="task-badges">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  >
                    {task.priority_display}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  >
                    {task.status_display}
                  </span>
                </div>
              </div>
              
              <div className="task-meta">
                <div className="meta-item">
                  <i className="icon-user"></i>
                  <span className="meta-text">
                    {task.responsible?.username || 'Не назначен'}
                  </span>
                </div>
                <div className="meta-item">
                  <i className="icon-calendar"></i>
                  <span className="meta-text">
                    Создано: {new Date(task.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                {task.deadline && (
                  <div className="meta-item">
                    <i className="icon-clock"></i>
                    <span className="meta-text">
                      Срок: {new Date(task.deadline).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="task-footer">
                <div className="footer-item">
                  <i className="icon-comment"></i>
                  <span>{task.comments_count || 0} комментариев</span>
                </div>
                <div className="footer-item">
                  <i className="icon-eye"></i>
                  <span>Подробнее</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default TaskList;