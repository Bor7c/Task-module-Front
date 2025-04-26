import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { loadTasks } from '../../redux/tasksSlice';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/Types';
import TaskCard from '../TaskCard/TaskCard'; // Импортируем новый компонент
import './TaskList.css';

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const [showCompleted, setShowCompleted] = useState(false);

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
        <div>
          <h2>Канбан Доска</h2>
          <p>Управляйте своими задачами</p>
        </div>
        {user && (
          <button onClick={handleCreateTask} className="create-task-btn">
            <i className="icon-plus"></i> Создать задачу
          </button>
        )}
      </div>

      <div className="kanban-table">
        {statusOrder.map(({ label, value }) => {
          if ((value === 'solved' || value === 'closed') && !showCompleted) {
            return null;
          }
          return (
            <div key={label} className="kanban-column">
              <h3 className="column-title">{label}</h3>
              <div className="task-list">
                {groupedTasks[label].length === 0 ? (
                  <div className="empty-state">
                    <p>Задачи отсутствуют</p>
                  </div>
                ) : (
                  groupedTasks[label].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task.id)}
                      getPriorityColor={getPriorityColor}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Кнопка показать/скрыть решенные */}
      <div className="show-completed-btn-wrapper">
        <button className="show-completed-btn" onClick={() => setShowCompleted(!showCompleted)}>
          {showCompleted ? 'Скрыть решенные и закрытые' : 'Показать решенные и закрытые'}
        </button>
      </div>
    </div>
  );
};

export default TaskList;
