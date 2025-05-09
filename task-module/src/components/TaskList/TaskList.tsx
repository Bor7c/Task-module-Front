import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loadTasks } from '../../redux/tasksSlice';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/Types';
import './TaskList.css';
import { 
  FaPlus, 
  FaClipboardCheck, 
  FaInbox, 
  FaSyncAlt, 
  FaRegCalendarAlt, 
  FaRegClock, 
  FaFilter, 
  FaSort, 
  FaExclamationCircle, 
  FaBell,
} from 'react-icons/fa';

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  
  // States for filtering and sorting
  const [showCompleted, setShowCompleted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [daysWithoutUpdate, setDaysWithoutUpdate] = useState<number | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    dispatch(loadTasks()).finally(() => {
      setTimeout(() => setIsRefreshing(false), 500);
    });
  };

  useEffect(() => {
    if (!tasks.length) { // Проверяем, загружены ли уже задачи
      dispatch(loadTasks());
    }
  }, [dispatch, tasks.length]);

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate('/create-task');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getDaysWithoutUpdate = (updatedAt: string) => {
    if (!updatedAt) return 0;
    
    const updateDate = new Date(updatedAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - updateDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getProfilePicture = (user: any) => {
    if (!user) return null;
    return user.profile_picture_url 
      // ? `http://localhost:8000${user.profile_picture_url}`
      // : null;
  };

  const getTodaysTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      if (!completedStatuses.includes(task.status) && task.deadline) {
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        return deadline.getTime() === today.getTime();
      }
      return false;
    }).length;
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => 
      !completedStatuses.includes(task.status) && task.is_overdue
    ).length;
  };

  // if (loading && !tasks.length) {
  //   return (
  //     <div className="task-list__loading">
  //       <div className="task-list__spinner"></div>
  //       <p>Загрузка задач...</p>
  //     </div>
  //   );
  // }

  if (error) {
    return <div className="task-list__error">{error}</div>;
  }

  const activeStatuses = ['in_progress', 'awaiting_response', 'awaiting_action'];
  const completedStatuses = ['solved', 'closed'];

  // Фильтрация задач
  let filteredTasks = [...tasks];
  
  if (filterType === 'today') {
    filteredTasks = filteredTasks.filter(task => 
      !completedStatuses.includes(task.status) && 
      task.deadline && 
      isToday(task.deadline)
    );
  } else if (filterType === 'overdue') {
    filteredTasks = filteredTasks.filter(task => task.is_overdue);
  }
  
  if (daysWithoutUpdate !== null) {
    filteredTasks = filteredTasks.filter(task => 
      getDaysWithoutUpdate(task.updated_at) >= daysWithoutUpdate
    );
  }

  const activeTasks = filteredTasks.filter(task => activeStatuses.includes(task.status));
  const completedTasks = filteredTasks.filter(task => completedStatuses.includes(task.status));
  
  let tasksToDisplay = showCompleted ? completedTasks : activeTasks;
  
  tasksToDisplay = tasksToDisplay.sort((a, b) => {
    const dateA = new Date(a[sortBy]).getTime();
    const dateB = new Date(b[sortBy]).getTime();
    
    return sortDirection === 'desc' 
      ? dateB - dateA
      : dateA - dateB;
  });

  const groupedActiveTasks = {
    'В работе': tasksToDisplay.filter(task => task.status === 'in_progress'),
    'Ожидает ответа': tasksToDisplay.filter(task => task.status === 'awaiting_response'),
    'Ожидает действия': tasksToDisplay.filter(task => task.status === 'awaiting_action')
  };
  
  const groupedCompletedTasks = {
    'Решено': tasksToDisplay.filter(task => task.status === 'solved'),
    'Закрыто': tasksToDisplay.filter(task => task.status === 'closed')
  };
  
  const displayGroups = showCompleted ? groupedCompletedTasks : groupedActiveTasks;
  
  const totalTasks = tasks.length;
  const tasksToday = getTodaysTasks();
  const overdueTasksCount = getOverdueTasks();

  const completedOverdueTasks = tasks.filter(task => 
    completedStatuses.includes(task.status) && task.is_overdue
  ).length;

  return (
    <div className="task-list">
      <div className="task-list__header">
        <div className="task-list__title">
          <h1>
            Задачи 
            <span className="task-list__counts-inline">
              (всего: {totalTasks}, активных: {activeTasks.length})
              {completedOverdueTasks > 0 && (
                <span className="task-list__overdue-completed-badge">
                  {completedOverdueTasks} завершено с просрочкой
                </span>
              )}
            </span>
          </h1>
          <div className="task-list__actions">
            <button 
              className={`task-list__refresh-btn ${isRefreshing ? 'task-list__refresh-btn--rotating' : ''}`}
              onClick={handleRefresh}
              aria-label="Обновить задачи"
              title="Обновить задачи"
            >
              <FaSyncAlt />
            </button>
            {user && (
              <button 
                className="task-list__create-btn"
                onClick={handleCreateTask}
                aria-label="Создать задачу"
              >
                <FaPlus /> <span>Создать задачу</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="task-list__filters">
          <div className="task-list__filter-section">
            <div className="task-list__filter-group">
              <label className="task-list__filter-label">
                <FaFilter /> Фильтры:
              </label>
              <div className="task-list__filter-buttons">
                <button 
                  className={`task-list__filter-btn ${filterType === 'all' ? 'task-list__filter-btn--active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  Все задачи
                </button>
                <button 
                  className={`task-list__filter-btn ${filterType === 'today' ? 'task-list__filter-btn--active' : ''}`}
                  onClick={() => setFilterType('today')}
                >
                  <FaBell /> Последний день ({tasksToday})
                </button>
                <button 
                  className={`task-list__filter-btn ${filterType === 'overdue' ? 'task-list__filter-btn--active' : ''}`}
                  onClick={() => setFilterType('overdue')}
                >
                  <FaExclamationCircle /> Просрочено ({overdueTasksCount})
                </button>
              </div>
            </div>
            
            <div className="task-list__filter-group">
              <label className="task-list__filter-label">
                <FaSort /> Сортировка:
              </label>
              <div className="task-list__filter-buttons">
                <button 
                  className={`task-list__filter-btn ${sortBy === 'created_at' ? 'task-list__filter-btn--active' : ''}`}
                  onClick={() => {
                    if (sortBy === 'created_at') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('created_at');
                      setSortDirection('desc');
                    }
                  }}
                >
                  По дате создания {sortBy === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className={`task-list__filter-btn ${sortBy === 'updated_at' ? 'task-list__filter-btn--active' : ''}`}
                  onClick={() => {
                    if (sortBy === 'updated_at') {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('updated_at');
                      setSortDirection('desc');
                    }
                  }}
                >
                  По дате обновления {sortBy === 'updated_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
            
            <div className="task-list__filter-group">
              <label className="task-list__filter-label">
                Без обновлений (дней):
              </label>
              <div className="task-list__filter-input-group">
                <input 
                  type="number" 
                  min="0"
                  className="task-list__filter-input"
                  value={daysWithoutUpdate === null ? '' : daysWithoutUpdate}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseInt(e.target.value);
                    setDaysWithoutUpdate(value);
                  }}
                  placeholder="Укажите дни"
                />
                {daysWithoutUpdate !== null && (
                  <button 
                    className="task-list__filter-clear"
                    onClick={() => setDaysWithoutUpdate(null)}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="task-list__tabs">
          <button 
            className={`task-list__tab ${!showCompleted ? 'task-list__tab--active' : ''}`}
            onClick={() => setShowCompleted(false)}
          >
            <FaInbox />
            <span>Активные</span>
            <span className="task-list__tab-count">{activeTasks.length}</span>
          </button>
          <button 
            className={`task-list__tab ${showCompleted ? 'task-list__tab--active' : ''}`}
            onClick={() => setShowCompleted(true)}
          >
            <FaClipboardCheck />
            <span>Завершенные</span>
            <span className="task-list__tab-count">
              {completedTasks.length}
              {completedOverdueTasks > 0 && (
                <span className="task-list__tab-overdue-badge" title="Задачи, завершенные с просрочкой">
                  {completedOverdueTasks}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
      
      <div className="task-list__columns">
        {Object.entries(displayGroups).map(([status, statusTasks]) => (
          <div key={status} className="task-list__column">
            <div className="task-list__column-header">
              <h2>{status}</h2>
              <span className="task-list__column-count">{statusTasks.length}</span>
            </div>
            <div className="task-list__cards">
              {statusTasks.length === 0 ? (
                <div className="task-list__empty">
                  <p>Нет задач</p>
                </div>
              ) : (
                statusTasks.map((task) => {
                  const isTaskToday = task.deadline && isToday(task.deadline);
                  const isTaskOverdue = task.is_overdue;
                  const profilePicture = task.responsible ? getProfilePicture(task.responsible) : null;
                  
                  return (
                    <div 
                      key={task.id}
                      className={`task-list__card ${isTaskToday ? 'task-list__card--today' : ''} ${isTaskOverdue ? 'task-list__card--overdue' : ''}`}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="task-list__card-header">
                        <div className={`task-list__priority task-list__priority-${task.priority}`}>
                          {task.priority_display}
                        </div>
                        <div className="task-list__task-id">#{task.id}</div>
                      </div>
                      
                      <h3 className="task-list__card-title">{task.title}</h3>
                      
                      {(isTaskToday || isTaskOverdue) && (
                        <div className="task-list__card-status">
                          {isTaskOverdue && (
                            <span className="task-list__card-status-badge task-list__card-status-overdue">
                              <FaExclamationCircle /> 
                              {completedStatuses.includes(task.status) 
                                ? 'Завершена с просрочкой' 
                                : 'Просрочена'}
                            </span>
                          )}
                          {isTaskToday && !isTaskOverdue && (
                            <span className="task-list__card-status-badge task-list__card-status-today">
                              <FaBell /> Последний день
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="task-list__card-footer">
                        <div className="task-list__card-dates">
                          <div className="task-list__created-at" title="Дата создания">
                            <FaRegClock /> {formatDate(task.created_at)}
                          </div>
                          {task.deadline && (
                            <div className={`task-list__deadline ${isTaskOverdue ? 'task-list__deadline--overdue' : ''} ${isTaskToday ? 'task-list__deadline--today' : ''}`} title="Срок выполнения">
                              <FaRegCalendarAlt /> {formatDate(task.deadline)}
                            </div>
                          )}
                        </div>
                        
                        {task.responsible && (
                          <div className="task-list__responsible">
                            <div className="task-list__avatar" title={task.responsible.username}>
                              {profilePicture ? (
                                <img 
                                  src={profilePicture} 
                                  alt={task.responsible.username}
                                  className="task-list__avatar-img"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="task-list__avatar-fallback">
                                  {task.responsible.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;