import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getAllUsers, patchUserInfo } from '../../redux/usersSlice';
import { UserRole } from '../../types/Types';
import './AdminUsersPage.css';
import Avatar from '../../components/Avatar/Avatar';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'developer', label: 'Разработчик' },
];
const FILTERS_LS_KEY = 'users_admin_page_filters';
const getInitFilters = () => {
  try {
    const fromLs = localStorage.getItem(FILTERS_LS_KEY);
    if (fromLs) return JSON.parse(fromLs);
  } catch {}
  return {
    roles: [] as string[],
    search: '',
  };
};

function RoleMultiSelect({
  value,
  onChange,
  options,
}: {
  value: string[];
  onChange: (sel: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const listener = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.roles-multiselect')) setOpened(false);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [opened]);

  const toggleValue = (v: string) => {
    if (value.includes(v)) onChange(value.filter((item) => item !== v));
    else onChange([...value, v]);
  };

  return (
    <div className="roles-multiselect">
      <button
        type="button"
        className="admin-users-page-btn admin-users-page-btn-rolesel"
        onClick={() => setOpened((p) => !p)}
      >
        {value.length
          ? options.filter(opt => value.includes(opt.value)).map(opt => opt.label).join(', ')
          : 'Фильтр по ролям'}
        <span style={{marginLeft: 7, fontSize: 13}}>▼</span>
      </button>
      {opened && (
        <div className="roles-multiselect-dropdown">
          {options.map((opt) => (
            <label key={opt.value} className="roles-multiselect-option">
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggleValue(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);
  // Filter states with LS init
  const [filters, setFilters] = useState(() => getInitFilters());
  useEffect(() => {
    localStorage.setItem(FILTERS_LS_KEY, JSON.stringify(filters));
  }, [filters]);
  // Edit/user states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [editFields, setEditFields] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    email: '',
    role: 'developer' as UserRole,
  });
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);
  // set edit fields
  const selectedUser = users.find((u) => u.id === selectedUserId);
  useEffect(() => {
    if (selectedUser) {
      setEditFields({
        last_name: selectedUser.last_name || '',
        first_name: selectedUser.first_name || '',
        middle_name: selectedUser.middle_name || '',
        email: selectedUser.email || '',
        role: selectedUser.role || 'developer',
      });
      setEditMode(false);
    }
  }, [selectedUser]);
  // Edit field handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value as UserRole) : value,
    }));
  };
  // Search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev: any) => ({ ...prev, search: e.target.value }));
  };
  const handleResetFilters = () => {
    setFilters({ roles: [], search: '' });
  };
  // Save handler
  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      const resultAction = await dispatch(
        patchUserInfo({ userId: selectedUser.id, data: editFields })
      );
      if (patchUserInfo.fulfilled.match(resultAction)) {
        dispatch(getAllUsers());
        setEditMode(false);
        setSelectedUserId(resultAction.payload.id);
      }
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
    }
  };
  // Users filtering
  const filteredUsers = useMemo(() => {
    let res = users;
    if (filters.roles.length) {
      res = res.filter((u) => filters.roles.includes(u.role));
    }
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      res = res.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.last_name?.toLowerCase().includes(q) ||
          u.first_name?.toLowerCase().includes(q) ||
          u.middle_name?.toLowerCase().includes(q)
      );
    }
    return res;
  }, [users, filters]);
  return (
    <div className="admin-users-page-root">
      {/* ФИЛЬТРЫ и СПИСОК */}
      <div className="admin-users-page-user-list">
        <h2>Пользователи</h2>
        <div className="admin-users-page-filters">
          <RoleMultiSelect
            value={filters.roles}
            onChange={(roles) => setFilters((prev: any) => ({ ...prev, roles }))}
            options={ROLE_OPTIONS}
          />
          <input
            type="text"
            placeholder="Поиск по имени / email..."
            value={filters.search}
            className="admin-users-page-search"
            onChange={handleSearch}
            autoComplete="off"
            spellCheck={false}
          />
          <button className="admin-users-page-btn admin-users-page-btn-reset" onClick={handleResetFilters}>
            Сбросить
          </button>
        </div>
        {/* СПИСОК */}
        {loading && <p>Загрузка...</p>}
        {error && <p className="admin-users-page-error">{error}</p>}
        <ul className="admin-users-page-list-ul">
          {filteredUsers.length === 0 ? (
            <li className="admin-users-page-list-empty">Не найдено</li>
          ) : (
            filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={user.id === selectedUserId ? 'admin-users-page-selected' : ''}
              >
                <Avatar
                src={user.profile_picture_url}
                alt={user.full_name}
                fallbackText={user.full_name?.slice(0, 2) || '?'}
                className="admin-users-page-user-avatar"
                />
                <div>
                  <strong>{user.first_name} {user.last_name}</strong>
                  <div className="admin-users-page-list-meta">
                    <span>{user.role_display}</span>
                    <span>{user.email}</span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
      {/* ДЕТАЛИ пользователя */}
      <div className="admin-users-page-user-details">
        {selectedUser ? (
          <>
            <div className="admin-users-page-user-card">
            <div className="avatar-fallback-1">
                <Avatar
                    src={selectedUser.profile_picture_url}
                    alt={selectedUser.full_name}
                    fallbackText={selectedUser.full_name?.slice(0, 2) || '?'}
                    className="avatar-fallback-1"
                />
            </div>
              <div className="admin-users-page-card-info">
                <h3>
                  {selectedUser.first_name} {selectedUser.last_name}
                  <span className="admin-users-page-card-username">@{selectedUser.username}</span>
                </h3>
                <div className="admin-users-page-card-roles">
                  <span className={`role-badge role-${selectedUser.role}`}>
                    {selectedUser.role_display}
                  </span>
                </div>
                <div className="admin-users-page-card-email">{selectedUser.email}</div>
              </div>
            </div>
            <div className="admin-users-page-user-fields">
              <label>
                Фамилия:
                {editMode ? (
                  <input
                    type="text"
                    name="first_name"
                    value={editFields.last_name}
                    onChange={handleEditChange}
                  />
                ) : (
                  <span>{selectedUser.last_name}</span>
                )}
              </label>
              <label>
                Имя:
                {editMode ? (
                  <input
                    type="text"
                    name="last_name"
                    value={editFields.first_name}
                    onChange={handleEditChange}
                  />
                ) : (
                  <span>{selectedUser.first_name}</span>
                )}
              </label>
              <label>
                Отчество:
                {editMode ? (
                  <input
                    type="text"
                    name="middle_name"
                    value={editFields.middle_name}
                    onChange={handleEditChange}
                  />
                ) : (
                  <span>{selectedUser.middle_name}</span>
                )}
              </label>
              <label>
                Email:
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={editFields.email}
                    onChange={handleEditChange}
                  />
                ) : (
                  <span>{selectedUser.email}</span>
                )}
              </label>
              <label>
                Роль:
                {editMode ? (
                  <select
                    name="role"
                    value={editFields.role}
                    onChange={handleEditChange}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>
                    <span className={`role-badge role-${selectedUser.role}`}>
                      {selectedUser.role_display}
                    </span>
                  </span>
                )}
              </label>
            </div>
            <div className="admin-users-page-actions">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    className="admin-users-page-btn admin-users-page-btn-save"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="admin-users-page-btn admin-users-page-btn-cancel"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="admin-users-page-btn admin-users-page-btn-edit"
                >
                  Редактировать
                </button>
              )}
            </div>
            <div className="admin-users-page-user-teams">
              <strong>Команды:</strong>
              {selectedUser.teams && selectedUser.teams.length > 0 ? (
                <ul>
                  {selectedUser.teams.map((team) => (
                    <li key={team.id}>
                      <span className="admin-users-team-name">{team.name}</span>{' '}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Нет команд</p>
              )}
            </div>
          </>
        ) : (
          <div className="admin-users-page-no-user">
            <span>Выберите пользователя для просмотра информации</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminUsersPage;