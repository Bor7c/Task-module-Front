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
      case 'critical': return '#ff6b6b';
      case 'high': return '#ffa502';
      case 'medium': return '#2ed573';
      case 'low': return '#70a1ff';
      default: return '#dfe4ea';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return '#1e90ff';
      case 'solved': return '#2ed573';
      case 'closed': return '#ff4757';
      case 'unassigned': return '#ff7f50';
      case 'awaiting_response': return '#ffa502';
      case 'awaiting_action': return '#ffa502';
      default: return '#dfe4ea';
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
        <h2>Список задач</h2>
        {user && (
          <button onClick={handleCreateTask} className="create-task-btn">
            <i className="icon-plus"></i> Новая задача
          </button>
        )}
      </div>
      
      <div className="task-grid">
        {tasks.map((task: Task) => (
          <div 
            key={task.id} 
            className="task-card"
            onClick={() => handleTaskClick(task.id)}
          >
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <span 
                className="priority-badge"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              >
                {task.priority_display}
              </span>
            </div>
            
            <div className="task-meta">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(task.status) }}
              >
                {task.status_display}
              </span>
              
              {task.responsible && (
                <span className="responsible">
                  <i className="icon-user"></i> {task.responsible.username}
                </span>
              )}
            </div>
            
            <div className="task-footer">
              <span className="comment-count">
                <i className="icon-comment"></i> {task.comments?.length || 0}
              </span>
              <span className="created-date">
                {new Date(task.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;