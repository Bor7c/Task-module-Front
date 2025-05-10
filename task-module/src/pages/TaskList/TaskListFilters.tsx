import React from 'react';
import { FaFilter, FaSort, FaBell, FaExclamationCircle, FaSearch } from 'react-icons/fa';

interface Props {
  filterType: 'all' | 'today' | 'overdue';
  setFilterType: (x: 'all' | 'today' | 'overdue') => void;
  sortBy: 'created_at' | 'updated_at';
  setSortBy: (x: 'created_at' | 'updated_at') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (x: 'asc' | 'desc') => void;
  daysWithoutUpdate: number | null;
  setDaysWithoutUpdate: (x: number | null) => void;
  tasksToday: number;
  overdueTasksCount: number;
  searchTitle: string;
  setSearchTitle: (value: string) => void;
  teams: any[];
  selectedTeam: number | null;
  setSelectedTeam: (value: number | null) => void;
  filterStartDate: string;
  setFilterStartDate: (value: string) => void;
  filterEndDate: string;
  setFilterEndDate: (value: string) => void;
  filterByDateType: 'created_at' | 'updated_at' | 'deadline';
  setFilterByDateType: (v: 'created_at' | 'updated_at' | 'deadline') => void;
}

const TaskListFilters: React.FC<Props> = ({
  filterType, setFilterType,
  sortBy, setSortBy, sortDirection, setSortDirection,
  daysWithoutUpdate, setDaysWithoutUpdate,
  tasksToday, overdueTasksCount,
  searchTitle, setSearchTitle,
  teams, selectedTeam, setSelectedTeam,
  filterStartDate, setFilterStartDate,
  filterEndDate, setFilterEndDate,
  filterByDateType, setFilterByDateType,
}) => (
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
          >Все задачи</button>
          <button
            className={`task-list__filter-btn ${filterType === 'today' ? 'task-list__filter-btn--active' : ''}`}
            onClick={() => setFilterType('today')}
          ><FaBell /> Последний день ({tasksToday})</button>
          <button
            className={`task-list__filter-btn ${filterType === 'overdue' ? 'task-list__filter-btn--active' : ''}`}
            onClick={() => setFilterType('overdue')}
          ><FaExclamationCircle /> Просрочено ({overdueTasksCount})</button>
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
        <label className="task-list__filter-label"><FaSearch /> Название:</label>
        <input
          className="task-list__filter-input"
          placeholder="Поиск по названию"
          value={searchTitle}
          onChange={e => setSearchTitle(e.target.value)}
        />
      </div>
      <div className="task-list__filter-group">
        <label className="task-list__filter-label">Команда:</label>
        <select
          className="task-list__filter-input"
          value={selectedTeam ?? ''}
          onChange={e => setSelectedTeam(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Все</option>
          {teams.map((team: any) =>
            <option key={team.id} value={team.id}>{team.name} ({team.members_count})</option>
          )}
        </select>
      </div>
      <div className="task-list__filter-group" style={{ flexWrap: 'wrap' }}>
        <label className="task-list__filter-label">Дата:</label>
        <select
          className="task-list__filter-input"
          value={filterByDateType}
          onChange={e => setFilterByDateType(e.target.value as any)}
        >
          <option value="created_at">Создания</option>
          <option value="updated_at">Обновления</option>
          <option value="deadline">Дедлайна</option>
        </select>
        <input
          className="task-list__filter-input"
          type="date"
          value={filterStartDate}
          onChange={e => setFilterStartDate(e.target.value)}
          max={filterEndDate || undefined}
        />
        <span>–</span>
        <input
          className="task-list__filter-input"
          type="date"
          value={filterEndDate}
          onChange={e => setFilterEndDate(e.target.value)}
          min={filterStartDate || undefined}
        />
        {(filterStartDate || filterEndDate) && (
          <button
            className="task-list__filter-clear"
            onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
          >×</button>
        )}
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
            onChange={e => {
              const value = e.target.value === '' ? null : parseInt(e.target.value);
              setDaysWithoutUpdate(value);
            }}
            placeholder="Укажите дни"
          />
          {daysWithoutUpdate !== null && (
            <button
              className="task-list__filter-clear"
              onClick={() => setDaysWithoutUpdate(null)}
            >×</button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default TaskListFilters;