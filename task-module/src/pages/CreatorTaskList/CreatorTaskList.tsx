import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loadCreatedTasks } from '../../redux/tasksSlice';
import { Task, TeamTask } from '../../types/Types';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSort, FaUsers, FaExclamationCircle, FaBell, FaRegCalendarAlt } from 'react-icons/fa';
import './CreatorTaskList.css';
import { DropMultiSelect } from './DropMultiselect';
import CreatorTaskListHeader from './CreatorTaskListHeader';

// ==== TaskRow ====
function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 345600) return `${Math.floor(diff / 86400)} дн назад`;
  return date.toLocaleDateString('ru-RU');
}
function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}
type TaskRowProps = {
  task: Task;
  onClick: (id: number) => void;
};
const TaskRow: React.FC<TaskRowProps> = ({ task, onClick }) => {
  const profilePicture = task.responsible?.profile_picture_url ?? '';
  const highlightOld = task.updated_at
    ? Math.floor((Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24)) > 7
    : false;
  const isOverdue = task.is_overdue;
  const deadlineIsToday = task.deadline && isToday(task.deadline);
  return (
    <div
      className={[
        'task-row',
        isOverdue && 'task-row--overdue',
        deadlineIsToday && 'task-row--today',
        highlightOld && 'task-row--old',
      ].filter(Boolean).join(' ')}
      onClick={() => onClick(task.id)}
      tabIndex={0}
      role="button"
      onKeyPress={e => e.key === 'Enter' && onClick(task.id)}
      title={task.title}
    >
      <div className={`task-row__cell task-row__priority task-row__priority--${task.priority}`}>
        {task.priority_display}
      </div>
      <div className="task-row__cell task-row__status">{task.status_display}</div>
      <div className="task-row__cell task-row__title">{task.title}</div>
      <div className="task-row__cell">
        <FaUsers style={{ marginRight: 4 }} />
        {task.team?.name || '—'}
      </div>
      <div className="task-row__cell">
        <FaRegCalendarAlt style={{ marginRight: 4 }} />
        {new Date(task.created_at).toLocaleDateString('ru-RU')}
      </div>
      <div className="task-row__cell">
        {task.deadline &&
          <>
            <FaRegCalendarAlt style={{ marginRight: 4 }} />
            <span className={
              isOverdue ? 'task-row__deadline--overdue'
                : deadlineIsToday ? 'task-row__deadline--today' : ''
            }>
              {new Date(task.deadline).toLocaleDateString('ru-RU')}
              {isOverdue && <FaExclamationCircle style={{ color: '#F44336', marginLeft: 4 }} />}
              {!isOverdue && deadlineIsToday && <FaBell style={{ color: '#FFC107', marginLeft: 4 }} />}
            </span>
          </>
        }
      </div>
      <div className="task-row__cell">{timeAgo(task.updated_at)}</div>
      <div className="task-row__cell task-row__responsible" title={task.responsible?.username || ''}>
        {profilePicture
          ? <img src={profilePicture} alt="" className="task-row__avatar" />
          : (task.responsible?.username?.[0] || '—').toUpperCase()}
      </div>
    </div>
  );
};
// ==== /TaskRow ====

// Фильтр-справочники
const STATUSES = [
  { value: 'awaiting_action', label: 'Ожидает действий' },
  { value: 'awaiting_response', label: 'Ожидает ответа' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'solved', label: 'Решена' },
  { value: 'closed', label: 'Закрыта' },
];
const PRIORITIES = [
  { value: 'critical', label: 'Критический' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
];

// ======= Pagination =======
type PaginationProps = {
  page: number;
  pageCount: number;
  setPage: (n: number) => void;
};
const Pagination: React.FC<PaginationProps> = ({ page, pageCount, setPage }) => {
  if (pageCount <= 1) return null;
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    if (
      pageCount > 7 &&
      i !== 0 &&
      i !== pageCount - 1 &&
      Math.abs(page - i) > 1 &&
      !(i === 1 && page < 4) &&
      !(i === pageCount - 2 && page > pageCount - 4)
    ) {
      if (pages[pages.length - 1] !== '...') pages.push('...');
      continue;
    }
    pages.push(i);
  }
  return (
    <div className="creator-tasks__pagination">
      <button
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
        className="creator-tasks__pagination-btn"
        aria-label="Назад"
      >
        ←
      </button>
      {pages.map(p =>
        typeof p === 'number' ?
          <button
            key={p}
            className={`creator-tasks__pagination-btn${p === page ? ' creator-tasks__pagination-btn--active' : ''}`}
            onClick={() => setPage(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button> :
          <span key={p + Math.random()} className="creator-tasks__pagination-ellipsis">{p}</span>
      )}
      <button
        disabled={page === pageCount - 1}
        onClick={() => setPage(page + 1)}
        className="creator-tasks__pagination-btn"
        aria-label="Вперёд"
      >
        →
      </button>
    </div>
  );
};
// ======= /Pagination =======
const ROWS_PER_PAGE = 10;

// ==== Сохранение/чтение фильтров (мульти значения!) ====
const LS_KEY = 'creatorTasksFiltersV2';
type MultiFilterState = {
  search: string;
  statuses: string[]; // для мультистатуса
  priorities: string[];
  teams: string[];
  dateFrom: string;
  dateTo: string;
  sort: string;
  sortDir: 'asc' | 'desc';
  page: number;
};
const getFiltersFromStorage = (): MultiFilterState => {
  try {
    const data = localStorage.getItem(LS_KEY);
    if (!data) return {
      search: '',
      statuses: [],
      priorities: [],
      teams: [],
      dateFrom: '',
      dateTo: '',
      sort: 'created_at',
      sortDir: 'desc',
      page: 0
    };
    const parsed = JSON.parse(data);
    return {
      search: parsed.search ?? '',
      statuses: Array.isArray(parsed.statuses) ? parsed.statuses : [],
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
      dateFrom: parsed.dateFrom ?? '',
      dateTo: parsed.dateTo ?? '',
      sort: parsed.sort ?? 'created_at',
      sortDir: parsed.sortDir ?? 'desc',
      page: parsed.page ?? 0,
    };
  } catch {
    return {
      search: '',
      statuses: [],
      priorities: [],
      teams: [],
      dateFrom: '',
      dateTo: '',
      sort: 'created_at',
      sortDir: 'desc',
      page: 0
    };
  }
};
const saveFiltersToStorage = (filters: MultiFilterState) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(filters));
  } catch { /* ignore */ }
};

// ==== Главный компонент ====
const CreatorTaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { createdTasks, loading, error } = useAppSelector(s => s.tasks);

  const initFilters = getFiltersFromStorage();
  const [search, setSearch] = useState(initFilters.search);
  const [statuses, setStatuses] = useState<string[]>(initFilters.statuses);
  const [priorities, setPriorities] = useState<string[]>(initFilters.priorities);
  const [teamsState, setTeamsState] = useState<string[]>(initFilters.teams);
  const [dateFrom, setDateFrom] = useState(initFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initFilters.dateTo);
  const [sort, setSort] = useState(initFilters.sort);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initFilters.sortDir);
  const [page, setPage] = useState(initFilters.page);

  useEffect(() => { dispatch(loadCreatedTasks()); }, [dispatch]);
  useEffect(() => {
    saveFiltersToStorage({ search, statuses, priorities, teams: teamsState, dateFrom, dateTo, sort, sortDir, page });
  }, [search, statuses, priorities, teamsState, dateFrom, dateTo, sort, sortDir, page]);

  // Сброс страницы при изменении фильтров/сортировки
  useEffect(() => { setPage(0); }, [search, statuses, priorities, teamsState, dateFrom, dateTo, sort, sortDir]);

  const teams: TeamTask[] = useMemo(() => {
    const unique = new Map<number, TeamTask>();
    createdTasks.forEach(t => t.team && unique.set(t.team.id, t.team));
    return Array.from(unique.values());
  }, [createdTasks]);
  const handleTaskClick = useCallback((id: number) => {
    navigate(`/tasks/${id}`);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    dispatch(loadCreatedTasks());
  }, [dispatch]);

  const handleCreateTask = useCallback(() => {
    navigate('/create-task');
  }, [navigate]);

  const filtered = useMemo(() => {
    return createdTasks.filter(task => {
      const createdDate = new Date(task.created_at);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      return (
        (!search || task.title.toLowerCase().includes(search.toLowerCase())) &&
        (statuses.length === 0 || statuses.includes(task.status)) &&
        (priorities.length === 0 || priorities.includes(task.priority)) &&
        (teamsState.length === 0 || (task.team && teamsState.includes(String(task.team.id)))) &&
        (!from || createdDate >= from) &&
        (!to || createdDate <= to)
      );
    });
  }, [createdTasks, search, statuses, priorities, teamsState, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sort as keyof Task];
      let valB = b[sort as keyof Task];
      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;
      if (sort === 'priority') {
        const p = ['critical', 'high', 'medium', 'low'];
        return (sortDir === 'asc' ? 1 : -1) * (p.indexOf(valA as string) - p.indexOf(valB as string));
      }
      if (sort === 'status') {
        return (sortDir === 'asc' ? 1 : -1) * String(valA).localeCompare(String(valB));
      }
      return (sortDir === 'asc' ? 1 : -1)
        * ((new Date(valA as string).getTime()) - (new Date(valB as string).getTime()));
    });
  }, [filtered, sort, sortDir]);

  const pageCount = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const paginated = useMemo(() =>
    sorted.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE),
    [sorted, page]
  );

  const totalTasks = createdTasks.length;
  const activeCount = createdTasks.filter(task => task.status !== 'closed' && task.status !== 'solved').length;
  const completedOverdueTasks = createdTasks.filter(task => task.status === 'solved' && new Date(task.updated_at) < new Date()).length;


  return (
    <div className="creator-tasks">
        
      <div className="creator-tasks__header">
      <CreatorTaskListHeader
        totalTasks={totalTasks}
        activeCount={activeCount}
        completedOverdueTasks={completedOverdueTasks}
        isRefreshing={loading}
        onRefresh={handleRefresh}
        user={{}}  // Здесь передавайте информацию о пользователе (если есть)
        onCreateTask={handleCreateTask}
      />
        <div className="creator-tasks__filters-row">
          <div className="creator-tasks__filter-group">
            <FaSearch />
            <input
              className="creator-tasks__filter-input"
              placeholder="Поиск по названию"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="creator-tasks__filter-group">
          <DropMultiSelect
            className="creator-tasks__filter-input creator-tasks__multiselect"
            options={STATUSES}
            value={statuses}
            onChange={setStatuses}
            placeholder="Статус"
            />
            <DropMultiSelect
            className="creator-tasks__filter-input creator-tasks__multiselect"
            options={PRIORITIES}
            value={priorities}
            onChange={setPriorities}
            placeholder="Приоритет"
            />
            <DropMultiSelect
            className="creator-tasks__filter-input creator-tasks__multiselect"
            options={teams.map(team => ({ value: String(team.id), label: team.name }))}
            value={teamsState}
            onChange={setTeamsState}
            placeholder="Команда"
            />
          </div>
          <div className="creator-tasks__filter-group">
            <input
              type="date"
              className="creator-tasks__filter-input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              title="С"
            />
            <span>—</span>
            <input
              type="date"
              className="creator-tasks__filter-input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              title="По"
            />
          </div>
          <div className="creator-tasks__filter-group">
            <FaSort />
            <select
              className="creator-tasks__filter-input"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="created_at">Создана</option>
              <option value="updated_at">Обновлена</option>
              <option value="deadline">Дедлайн</option>
              <option value="priority">Приоритет</option>
              <option value="status">Статус</option>
            </select>
            <button
              className="creator-tasks__filter-sortdir"
              onClick={() => setSortDir(s => s === 'asc' ? 'desc' : 'asc')}
              title={sortDir === 'desc' ? "Сортировка по убыванию" : "Сортировка по возрастанию"}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      <div className="creator-tasks__table">
        <div className="creator-tasks__row creator-tasks__row--head">
          <div className="creator-tasks__cell creator-tasks__cell--priority">Приоритет</div>
          <div className="creator-tasks__cell creator-tasks__cell--status">Статус</div>
          <div className="creator-tasks__cell creator-tasks__cell--name">Название</div>
          <div className="creator-tasks__cell">Команда</div>
          <div className="creator-tasks__cell">
            <FaRegCalendarAlt style={{ marginRight: 4, marginBottom: -2 }} />
            Создана
          </div>
          <div className="creator-tasks__cell">
            <FaRegCalendarAlt style={{ marginRight: 4, marginBottom: -2 }} />
            Дедлайн
          </div>
          <div className="creator-tasks__cell">Изменен</div>
          <div className="creator-tasks__cell">Ответств.</div>
        </div>
        {loading ?
          <div className="creator-tasks__row"><div className="creator-tasks__spinner"></div>Загрузка…</div> :
          error ?
            <div className="creator-tasks__row"><div className="creator-tasks__error">{error}</div></div> :
            paginated.length === 0 ?
              <div className="creator-tasks__row">Нет задач по выбранным условиям</div> :
              paginated.map(task =>
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                />
              )

        }
      </div>
      <Pagination page={page} pageCount={pageCount} setPage={setPage} />
    </div>
  );
};

export default CreatorTaskList;