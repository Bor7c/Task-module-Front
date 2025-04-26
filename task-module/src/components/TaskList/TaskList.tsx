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
      case 'awaiting_response':
      case 'awaiting_action':
        return 'var(--status-awaiting)';
      case 'solved': return 'var(--status-solved)';
      case 'closed': return 'var(--status-closed)';
      case 'unassigned': return 'var(--status-unassigned)';
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

  // Статусы и их сопоставление
  const statusOrder = [
    { label: 'Не назначено', value: 'unassigned' },
    { label: 'В работе', value: 'in_progress' },
    { label: 'Ожидает ответа', value: 'awaiting_response' },
    { label: 'Ожидает действия', value: 'awaiting_action' },
    { label: 'Решено', value: 'solved' },
    { label: 'Закрыто', value: 'closed' },
  ] as const;

  type StatusLabel = typeof statusOrder[number]['label'];

  const groupedTasks: Record<StatusLabel, Task[]> = statusOrder.reduce((acc, { label, value }) => {
    acc[label] = tasks.filter((task) => task.status === value);
    return acc;
  }, {} as Record<StatusLabel, Task[]>);

  return (
    <div className="kanban-board-container">
      <div className="board-header">
        <h2>Канбан Доска</h2>
        <p>Управляйте задачами по статусам</p>
        {user && (
          <button onClick={handleCreateTask} className="create-task-btn">
            <i className="icon-plus"></i> Создать задачу
          </button>
        )}
      </div>

      <div className="kanban-columns">
        {statusOrder.map(({ label }) => (
          <div key={label} className="kanban-column">
            <h3 className="column-title">{label}</h3>
            <div className="task-list">
              {groupedTasks[label].length === 0 ? (
                <div className="empty-state">
                  <p>Задачи отсутствуют</p>
                </div>
              ) : (
                groupedTasks[label].map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="task-header">
                      <h4 className="task-title">{task.title}</h4>
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
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
