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

const priorityWeight = (priority: string) => {
  switch(priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

const TaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tasks, loading, error } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);

  const [showCompleted, setShowCompleted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority' | 'deadline'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [daysWithoutUpdate, setDaysWithoutUpdate] = useState<number | null>(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterByDateType, setFilterByDateType] = useState<'created_at' | 'updated_at' | 'deadline'>('created_at');
  const [filterPriority, setFilterPriority] = useState<'' | 'critical' | 'high' | 'medium' | 'low'>('');
  const [taskScope, setTaskScope] = useState<'all' | 'responsible' | 'allTasks'>(
    () => localStorage.getItem('taskScope') as 'all' | 'responsible' | 'allTasks' || 'all'
  );

  useEffect(() => {
    const savedFilters = {
      searchTitle: localStorage.getItem('filter_searchTitle'),
      selectedTeam: localStorage.getItem('filter_selectedTeam'),
      startDate: localStorage.getItem('filter_startDate'),
      endDate: localStorage.getItem('filter_endDate'),
      dateType: localStorage.getItem('filter_dateType'),
      filterType: localStorage.getItem('filter_type'),
      sortBy: localStorage.getItem('filter_sortBy'),
      sortDirection: localStorage.getItem('filter_sortDirection'),
      daysWithoutUpdate: localStorage.getItem('filter_daysWithoutUpdate'),
      filterPriority: localStorage.getItem('filter_priority'),
    };
    if (savedFilters.searchTitle) setSearchTitle(savedFilters.searchTitle);
    if (savedFilters.selectedTeam) setSelectedTeam(Number(savedFilters.selectedTeam));
    if (savedFilters.startDate) setFilterStartDate(savedFilters.startDate);
    if (savedFilters.endDate) setFilterEndDate(savedFilters.endDate);
    if (savedFilters.dateType) setFilterByDateType(savedFilters.dateType as any);
    if (savedFilters.filterType) setFilterType(savedFilters.filterType as any);
    if (savedFilters.sortBy) setSortBy(savedFilters.sortBy as any);
    if (savedFilters.sortDirection) setSortDirection(savedFilters.sortDirection as any);
    if (savedFilters.daysWithoutUpdate) setDaysWithoutUpdate(Number(savedFilters.daysWithoutUpdate));
    if (savedFilters.filterPriority) setFilterPriority(savedFilters.filterPriority as any);
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem('filter_searchTitle', searchTitle);
    if (selectedTeam !== null) localStorage.setItem('filter_selectedTeam', String(selectedTeam));
    else localStorage.removeItem('filter_selectedTeam');

    localStorage.setItem('filter_startDate', filterStartDate);
    localStorage.setItem('filter_endDate', filterEndDate);
    localStorage.setItem('filter_dateType', filterByDateType);
    localStorage.setItem('filter_type', filterType);
    localStorage.setItem('filter_sortBy', sortBy);
    localStorage.setItem('filter_sortDirection', sortDirection);
    if (daysWithoutUpdate !== null) localStorage.setItem('filter_daysWithoutUpdate', String(daysWithoutUpdate));
    else localStorage.removeItem('filter_daysWithoutUpdate');
    localStorage.setItem('filter_priority', filterPriority);
  };

  useEffect(() => {
    saveToLocalStorage();
  }, [searchTitle, selectedTeam, filterStartDate, filterEndDate, filterByDateType, filterType, sortBy, sortDirection, daysWithoutUpdate, filterPriority]);

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

  const resetFilters = () => {
    setSearchTitle('');
    setSelectedTeam(null);
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterByDateType('created_at');
    setFilterType('all');
    setSortBy('created_at');
    setSortDirection('desc');
    setDaysWithoutUpdate(null);
    setFilterPriority('');
    localStorage.clear();
  };

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

  let filteredTasks = [...tasks];

  if (searchTitle.trim())
    filteredTasks = filteredTasks.filter(
      task =>
        task.title &&
        task.title.toLowerCase().includes(searchTitle.trim().toLowerCase())
    );
  if (selectedTeam !== null)
    filteredTasks = filteredTasks.filter(
      task => task.team && task.team.id === selectedTeam
    );

  if (filterStartDate || filterEndDate) {
    filteredTasks = filteredTasks.filter(task =>
      isDateInRange(task[filterByDateType], filterStartDate, filterEndDate)
    );
  }

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

  if (filterPriority) {
    filteredTasks = filteredTasks.filter(
      task => task.priority === filterPriority
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
    if (sortBy === 'priority') {
      const wA = priorityWeight(a.priority);
      const wB = priorityWeight(b.priority);
      return sortDirection === 'desc' ? wB - wA : wA - wB;
    }
    if (sortBy === 'deadline') {
      const dA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const dB = b.deadline ? new Date(b.deadline).getTime() : 0;
      return sortDirection === 'desc' ? dB - dA : dA - dB;
    }
    const dateA = new Date(a[sortBy]).getTime();
    const dateB = new Date(b[sortBy]).getTime();
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
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
        userRole={user ? user.role : 'developer'}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
      />
      <button className="task-list__reset-filters-btn" onClick={resetFilters}>
        Сбросить фильтры
      </button>
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