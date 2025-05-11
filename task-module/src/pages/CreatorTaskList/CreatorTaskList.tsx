import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loadCreatedTasks } from '../../redux/tasksSlice';
import { Task, TeamTask } from '../../types/Types';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaSort, FaUsers, FaExclamationCircle, FaBell, FaRegCalendarAlt, FaComments } from 'react-icons/fa';
import './CreatorTaskList.css';

// ========================== TaskRow =======================
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
        onKeyPress={(e) => e.key === 'Enter' && onClick(task.id)}
        title={task.title}
      >
        <div className={`task-row__cell task-row__priority task-row__priority--${task.priority}`}>
          {task.priority_display}
        </div>
        <div className="task-row__cell task-row__status">{task.status_display}</div>
        <div className="task-row__cell task-row__title">{task.title}</div>
        <div className="task-row__cell"><FaUsers style={{ marginRight: 4 }} />{task.team?.name || '—'}</div>
        <div className="task-row__cell">{new Date(task.created_at).toLocaleDateString('ru-RU')}</div>
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
        <div className="task-row__cell task-row__comments">
          {task.comments_count > 0 && (<><FaComments /> {task.comments_count}</>)}
        </div>
        <div className="task-row__cell task-row__responsible" title={task.responsible?.username || ''}>
          {profilePicture
            ? <img src={profilePicture} alt="" className="task-row__avatar" />
            : (task.responsible?.username?.[0] || '—').toUpperCase()}
        </div>
      </div>
    );
  };
// ========================== /TaskRow =======================


// ============= CreatorTaskList MAIN ===================
const STATUSES = [
  { value: '', label: 'Статус' },
  { value: 'awaiting_action', label: 'Ожидает действий' },
  { value: 'awaiting_response', label: 'Ожидает ответа' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'solved', label: 'Решена' },
  { value: 'closed', label: 'Закрыта' },
];
const PRIORITIES = [
  { value: '', label: 'Приоритет' },
  { value: 'critical', label: 'Критический' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
];

const CreatorTaskList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { createdTasks, loading, error } = useAppSelector(s => s.tasks);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [team, setTeam] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => { dispatch(loadCreatedTasks()); }, [dispatch]);

  const teams: TeamTask[] = useMemo(() => {
    const unique = new Map<number, TeamTask>();
    createdTasks.forEach(t => t.team && unique.set(t.team.id, t.team));
    return Array.from(unique.values());
  }, [createdTasks]);

  const handleTaskClick = useCallback((id: number) => {
    navigate(`/tasks/${id}`);
  }, [navigate]);

  const filtered = useMemo(() => {
    return createdTasks.filter(task => {
      const createdDate = new Date(task.created_at);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;
      return (
        (!search || task.title.toLowerCase().includes(search.toLowerCase())) &&
        (!status || task.status === status) &&
        (!priority || task.priority === priority) &&
        (!team || String(task.team?.id) === team) &&
        (!from || createdDate >= from) &&
        (!to || createdDate <= to)
      );
    });
  }, [createdTasks, search, status, priority, team, dateFrom, dateTo]);

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

  return (
    <div className="creator-tasks">
      <div className="creator-tasks__header">
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
            <select className="creator-tasks__filter-input" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select className="creator-tasks__filter-input" value={priority} onChange={e => setPriority(e.target.value)}>
              {PRIORITIES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select className="creator-tasks__filter-input" value={team} onChange={e => setTeam(e.target.value)}>
              <option value="">Команда</option>
              {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
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
              <option value="priority">Критичность</option>
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
          <div className="creator-tasks__cell">Создана</div>
          <div className="creator-tasks__cell">Дедлайн</div>
          <div className="creator-tasks__cell">Изм.</div>
          <div className="creator-tasks__cell">💬</div>
          <div className="creator-tasks__cell">Ответств.</div>
        </div>
  
        {loading ?
          <div className="creator-tasks__row"><div className="creator-tasks__spinner"></div>Загрузка…</div> :
          error ?
            <div className="creator-tasks__row"><div className="creator-tasks__error">{error}</div></div> :
            sorted.length === 0 ?
              <div className="creator-tasks__row">Нет задач по выбранным условиям</div> :
              sorted.map(task =>
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={handleTaskClick}
                />
              )
        }
      </div>
    </div>
  );
  
};

export default CreatorTaskList;