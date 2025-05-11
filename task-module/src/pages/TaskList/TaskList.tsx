import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loadResponsibleTasks, loadTasks, loadTeamTasks } from '../../redux/tasksSlice';
import { useNavigate } from 'react-router-dom';
import { Task } from '../../types/Types';
import './TaskList.css';
import TaskListHeader from './TaskListHeader';
import TaskListFilters from './TaskListFilters';
import TaskListTabs from './TaskListTabs';
import TaskListColumns from './TaskListColumns';

const activeStatuses = ['in_progress', 'awaiting_response', 'awaiting_action'];
const completedStatuses = ['solved', 'closed'];

function isDateInRange(
  value: string | null | undefined,
  start: string,
  end: string
): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  if (start && date < new Date(start)) return false;
  if (end && date > new Date(end + 'T23:59:59')) return false;
  return true;
}

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  const [showCompleted, setShowCompleted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [daysWithoutUpdate, setDaysWithoutUpdate] = useState<number | null>(null);

  // Новые фильтры
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterByDateType, setFilterByDateType] = useState<'created_at' | 'updated_at' | 'deadline'>('created_at');
  const [taskScope, setTaskScope] = useState<'all' | 'responsible' | 'allTasks'>(
    () => localStorage.getItem('taskScope') as 'all' | 'responsible' | 'allTasks' || 'all'
  );

  // Обработчик для загрузки задач в зависимости от роли
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (taskScope === 'responsible') {
      dispatch(loadResponsibleTasks()).finally(() => setIsRefreshing(false));
    } else if (taskScope === 'allTasks' && (user?.role === 'admin' || user?.role === 'manager')) {
      dispatch(loadTasks()).finally(() => setIsRefreshing(false));
    } else {
      dispatch(loadTeamTasks()).finally(() => setIsRefreshing(false));
    }
  };

  const handleTaskClick = (taskId: number) => navigate(`/tasks/${taskId}`);
  const handleCreateTask = () => navigate('/create-task');
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit', year: 'numeric'});
  };

  useEffect(() => {
    localStorage.setItem('taskScope', taskScope);
    if (taskScope === 'responsible') {
      dispatch(loadResponsibleTasks());
    } else if (taskScope === 'allTasks' && (user?.role === 'admin' || user?.role === 'manager')) {
      dispatch(loadTasks());
    } else {
      dispatch(loadTeamTasks());
    }
  }, [dispatch, taskScope, user?.role]);
  
  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
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
    return user.profile_picture_url || null;
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
  const getOverdueTasks = () => tasks.filter(task => !completedStatuses.includes(task.status) && task.is_overdue).length;

  // Собираем список команд для фильтра
  const teams = useMemo(
    () =>
      Array.from(
        new Map(
          tasks.filter(task => task.team).map(task => [task.team.id, task.team])
        ).values()
      ),
    [tasks]
  );

  if (loading && !tasks.length)
    return (
      <div className="task-list__loading">
        <div className="task-list__spinner"></div>
        <p>Загрузка задач...</p>
      </div>
    );
  if (error)
    return <div className="task-list__error">{error}</div>;

  // ====== Фильтрация ======

  let filteredTasks = [...tasks];

  // Фильтр по названию
  if (searchTitle.trim())
    filteredTasks = filteredTasks.filter(
      task =>
        task.title &&
        task.title.toLowerCase().includes(searchTitle.trim().toLowerCase())
    );

  // Фильтр по команде
  if (selectedTeam !== null)
    filteredTasks = filteredTasks.filter(
      task => task.team && task.team.id === selectedTeam
    );

  // Фильтр по диапазону дат
  if (filterStartDate || filterEndDate) {
    filteredTasks = filteredTasks.filter(task =>
      isDateInRange(task[filterByDateType], filterStartDate, filterEndDate)
    );
  }

  // Остальные фильтры
  if (filterType === 'today') {
    filteredTasks = filteredTasks.filter(
      task =>
        !completedStatuses.includes(task.status) &&
        task.deadline &&
        isToday(task.deadline)
    );
  } else if (filterType === 'overdue') {
    filteredTasks = filteredTasks.filter(task => task.is_overdue);
  }

  if (daysWithoutUpdate !== null) {
    filteredTasks = filteredTasks.filter(
      task => getDaysWithoutUpdate(task.updated_at) >= daysWithoutUpdate
    );
  }

  const activeTasks = filteredTasks.filter(task =>
    activeStatuses.includes(task.status)
  );
  const completedTasks = filteredTasks.filter(task =>
    completedStatuses.includes(task.status)
  );
  let tasksToDisplay = showCompleted ? completedTasks : activeTasks;
  tasksToDisplay = tasksToDisplay.sort((a, b) => {
    const dateA = new Date(a[sortBy]).getTime();
    const dateB = new Date(b[sortBy]).getTime();
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Группировка по статусу (но можно добавить по команде — для примера, оставим как есть)
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

  // Счётчики
  const totalTasks = tasks.length;
  const tasksToday = getTodaysTasks();
  const overdueTasksCount = getOverdueTasks();
  const completedOverdueTasks = tasks.filter(
    task => completedStatuses.includes(task.status) && task.is_overdue
  ).length;

  return (
    <div className="task-list">
      <TaskListHeader
        totalTasks={totalTasks}
        activeCount={activeTasks.length}
        completedOverdueTasks={completedOverdueTasks}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        user={user}
        onCreateTask={handleCreateTask}
      />
      <TaskListFilters
        filterType={filterType}
        setFilterType={setFilterType}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        daysWithoutUpdate={daysWithoutUpdate}
        setDaysWithoutUpdate={setDaysWithoutUpdate}
        tasksToday={tasksToday}
        overdueTasksCount={overdueTasksCount}
        searchTitle={searchTitle}
        setSearchTitle={setSearchTitle}
        teams={teams}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        filterStartDate={filterStartDate}
        setFilterStartDate={setFilterStartDate}
        filterEndDate={filterEndDate}
        setFilterEndDate={setFilterEndDate}
        filterByDateType={filterByDateType}
        setFilterByDateType={setFilterByDateType}
        taskScope={taskScope}
        setTaskScope={setTaskScope}
        userRole={user ? user.role : 'developer'} // Если user == null, используем роль по умолчанию
      />
      <TaskListTabs
        showCompleted={showCompleted}
        setShowCompleted={setShowCompleted}
        activeCount={activeTasks.length}
        completedCount={completedTasks.length}
        completedOverdueTasks={completedOverdueTasks}
      />
      <TaskListColumns
        displayGroups={displayGroups}
        showCompleted={showCompleted}
        completedStatuses={completedStatuses}
        isToday={isToday}
        formatDate={formatDate}
        handleTaskClick={handleTaskClick}
        getProfilePicture={getProfilePicture}
      />
    </div>
  );
};

export default TaskList;
