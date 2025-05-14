// src/pages/AdminUsersPage/AdminUsersPage.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getAllUsers } from '../../redux/usersSlice';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.users);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="admin-users-page">
      <div className="user-list">
        <h2>Пользователи</h2>
        {loading && <p>Загрузка...</p>}
        {error && <p className="error">{error}</p>}
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={user.id === selectedUserId ? 'selected' : ''}
            >
              {user.username} ({user.role_display})
            </li>
          ))}
        </ul>
      </div>
      <div className="user-details">
        {selectedUser ? (
          <>
            <h2>Информация о пользователе</h2>
            <img src={selectedUser.profile_picture_url} alt={selectedUser.username} className="profile-picture" />
            <p><strong>ФИО:</strong> {selectedUser.username}</p>
            <p><strong>Username:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Роль:</strong> {selectedUser.role_display}</p>
            <p><strong>Команды:</strong></p>
            <ul>
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
            </ul>
          </>
        ) : (
          <p>Выберите пользователя, чтобы увидеть информацию</p>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
