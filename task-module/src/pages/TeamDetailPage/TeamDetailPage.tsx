import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  getTeamDetail,
  removeTeamMember,
  addTeamMember,
  clearSelectedTeam,
  updateMembers, // ⬅️ новое действие
} from '../../redux/teamsSlice';
import { getAllUsers } from '../../redux/usersSlice';
import './TeamDetail.css';

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedTeam, loading } = useAppSelector((state) => state.teams);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const allUsers = useAppSelector((state) => state.users.users);

  const [search, setSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getTeamDetail(Number(id)));
      if (userRole === 'admin') {
        dispatch(getAllUsers());
      }
    }

    return () => {
      dispatch(clearSelectedTeam());
    };
  }, [dispatch, id, userRole]);

  const handleRemove = async (userId: number) => {
    if (!selectedTeam) return;
    if (window.confirm('Удалить пользователя из команды?')) {
      setIsUpdating(true);
      const result = await dispatch(removeTeamMember({ teamId: Number(id), userId }));
      if (removeTeamMember.fulfilled.match(result)) {
        dispatch(updateMembers(result.payload.members)); // ⚡ обновляем только участников
      }
      setIsUpdating(false);
    }
  };

  const handleAdd = async (userId: number) => {
    if (!selectedTeam) return;
    setIsUpdating(true);
    const result = await dispatch(addTeamMember({ teamId: Number(id), userId }));
    if (addTeamMember.fulfilled.match(result)) {
      dispatch(updateMembers(result.payload.members)); // ⚡ обновляем только участников
    }
    setIsUpdating(false);
  };

  const isMember = (userId: number) =>
    selectedTeam?.members?.some((m: any) => m.id === userId);

  const filteredUsers = allUsers.filter((u) => {
    const query = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(query) ||
      u.first_name.toLowerCase().includes(query) ||
      u.last_name.toLowerCase().includes(query)
    );
  });

  if (loading || !selectedTeam) return <div>Загрузка...</div>;

  return (
    <div className="team-detail">
      <button className="team-detail__back-btn" onClick={() => navigate(-1)}>
        Назад
      </button>

      <h2>{selectedTeam.name}</h2>
      <p className="team-description">
        {selectedTeam.description || 'Нет описания'}
      </p>

      <div className="team-detail__columns">
        {/* LEFT: TEAM MEMBERS */}
        <div className="team-column">
          <h3>Участники</h3>
          <div className="team-members">
            {selectedTeam.members?.map((member: any) => (
              <div className="member-row" key={member.id}>
                <img
                  src={member.profile_picture_url || '/default-avatar.png'}
                  alt="avatar"
                  className="avatar"
                />
                <div className="member-info">
                  <div className="member-username">
                    {member.username} ({member.first_name} {member.last_name})
                  </div>
                  <div className="member-meta">
                    {member.role_display} • {member.email}
                  </div>
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="remove-btn"
                    disabled={isUpdating}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: USERS TO ADD */}
        {userRole === 'admin' && (
          <div className="team-column">
            <h3>Добавить участника</h3>
            <input
              type="text"
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по логину, имени или фамилии"
            />
            <div className="team-members">
              {filteredUsers.map((user: any) => (
                <div className="member-row" key={user.id}>
                  <img
                    src={user.profile_picture_url || '/default-avatar.png'}
                    alt="avatar"
                    className="avatar"
                  />
                  <div className="member-info">
                    <div className="member-username">
                      {user.username} ({user.first_name} {user.last_name})
                    </div>
                    <div className="member-meta">
                      {user.role_display} • {user.email}
                    </div>
                  </div>
                  {!isMember(user.id) ? (
                    <button
                      onClick={() => handleAdd(user.id)}
                      className="add-btn"
                      disabled={isUpdating}
                    >
                      + Добавить
                    </button>
                  ) : (
                    <span className="already-member">Уже в команде</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
