import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getAllUsers, patchUserInfo } from '../../redux/usersSlice';
import { UserRole } from '../../types/Types';
import './AdminUsersPage.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'developer', label: 'Разработчик' },
];

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // ✅ Тип editFields строго определён, включая UserRole
  const [editFields, setEditFields] = useState<{
    last_name: string;
    first_name: string;
    middle_name: string;
    email: string;
    role: UserRole;
  }>({
    last_name: '',
    first_name: '',
    middle_name: '',
    email: '',
    role: 'developer',
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

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

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Специально обрабатываем "role", чтобы привести к типу UserRole
    setEditFields((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value as UserRole) : value,
    }));
  };

  const handleSave = () => {
    if (selectedUser) {
      dispatch(
        patchUserInfo({
          userId: selectedUser.id,
          data: editFields,
        })
      );
      setEditMode(false);
    }
  };

  return (
    <div className="admin-users-page-root">
      <div className="admin-users-page-user-list">
        <h2>Пользователи</h2>
        {loading && <p>Загрузка...</p>}
        {error && <p className="admin-users-page-error">{error}</p>}
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={
                user.id === selectedUserId ? 'admin-users-page-selected' : ''
              }
            >
              {user.username} ({user.role_display})
            </li>
          ))}
        </ul>
      </div>
      <div className="admin-users-page-user-details">
        {selectedUser ? (
          <>
            <h2>Информация о пользователе</h2>
            <img
              src={selectedUser.profile_picture_url}
              alt={selectedUser.username}
              className="admin-users-page-profile-picture"
            />
            <div className="admin-users-page-user-fields">
              <label>
                Фамилия:
                {editMode ? (
                  <input
                    type="text"
                    name="last_name"
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
                    name="first_name"
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
                  <span>{selectedUser.role_display}</span>
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
                      {team.name} ({team.members_count} участников)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Нет команд</p>
              )}
            </div>
          </>
        ) : (
          <p>Выберите пользователя, чтобы увидеть информацию</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
