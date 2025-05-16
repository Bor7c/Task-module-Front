import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  getTeamDetail,
  removeTeamMember,
  addTeamMember,
  clearSelectedTeam,
  updateMembers,
  updateTeam,
  setSelectedTeam,
} from '../../redux/teamsSlice';
import { getAllUsers } from '../../redux/usersSlice';
import './TeamDetail.css';
import LoadingScreen from '../../components/common/LoadingScreen';
import Avatar from '../../components/Avatar/Avatar';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedTeam, loading } = useAppSelector((state) => state.teams);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const allUsers = useAppSelector((state) => state.users.users);

  const [search, setSearch] = useState('');
  const [searchMembers, setSearchMembers] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [newTeamName, setNewTeamName] = useState(selectedTeam?.name || '');
  const [newTeamDescription, setNewTeamDescription] = useState(selectedTeam?.description || '');

  useEffect(() => {
    if (id) {
      dispatch(getTeamDetail(Number(id)));
      // Менеджеры тоже могут добавлять пользователей, поэтому запрашиваем список пользователей для них
      if (userRole === 'admin' || userRole === 'manager') {
        dispatch(getAllUsers());
      }
    }

    return () => {
      dispatch(clearSelectedTeam());
    };
  }, [dispatch, id, userRole]);

  useEffect(() => {
    if (selectedTeam) {
      setNewTeamName(selectedTeam.name || '');
      setNewTeamDescription(selectedTeam.description || '');
    }
  }, [selectedTeam]);

  const handleRemove = async (userId: number) => {
    if (!selectedTeam) return;
    if (window.confirm('Удалить пользователя из команды?')) {
      setIsUpdating(true);
      const result = await dispatch(removeTeamMember({ teamId: Number(id), userId }));
      if (removeTeamMember.fulfilled.match(result)) {
        dispatch(updateMembers(result.payload.members));
      }
      setIsUpdating(false);
    }
  };

  const handleAdd = async (userId: number) => {
    if (!selectedTeam) return;
    setIsUpdating(true);
    const result = await dispatch(addTeamMember({ teamId: Number(id), userId }));
    if (addTeamMember.fulfilled.match(result)) {
      dispatch(updateMembers(result.payload.members));
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

  const filteredMembers = selectedTeam?.members?.filter((member: any) => {
    const query = searchMembers.toLowerCase();
    return (
      member.username.toLowerCase().includes(query) ||
      member.first_name.toLowerCase().includes(query) ||
      member.last_name.toLowerCase().includes(query)
    );
  });

  const handleUpdateTeam = async () => {
    if (selectedTeam && newTeamName && newTeamDescription !== undefined) {
      setIsUpdating(true);
      const result = await dispatch(
        updateTeam({
          id: selectedTeam.id,
          data: { name: newTeamName, description: newTeamDescription }
        })
      );
      if (updateTeam.fulfilled.match(result)) {
        dispatch(setSelectedTeam({
          ...selectedTeam,
          name: newTeamName,
          description: newTeamDescription
        }));
        setIsEditing(false);
      }
      setIsUpdating(false);
    }
  };

  if (loading || !selectedTeam) return <div><LoadingScreen /></div>;

  return (
    <div className="team-detail">
      <button className="team-detail__back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Назад
      </button>

      <div className="team-detail__header">
        {isEditing && userRole === 'admin' ? (
          <>
            <input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="team-name-input"
            />
            <textarea
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
              className="team-description-input"
            />
            <div className="edit-buttons">
              <button onClick={handleUpdateTeam} className="save-btn" disabled={isUpdating}>
                Сохранить
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">
                Отменить
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="team-name">
              {selectedTeam.name}
              {userRole === 'admin' && (
                <button className="edit-icon-btn" onClick={() => setIsEditing(true)}>
                  <FaEdit/>
                </button>
              )}
            </h2>
            <div className="team-description">
              <p>{selectedTeam.description || 'Нет описания'}</p>
            </div>
          </>
        )}
      </div>

      <div className="team-detail__columns">
        {/* LEFT: TEAM MEMBERS */}
        <div className="team-column">
          <h3>Участники</h3>
          <input
            type="text"
            className="search-input"
            value={searchMembers}
            onChange={(e) => setSearchMembers(e.target.value)}
            placeholder="Поиск по участникам"
          />
          <div className="team-members">
            {filteredMembers?.map((member: any) => (
              <div className="member-row" key={member.id}>
                <Avatar
                  src={member.profile_picture_url || null}
                  fallbackText={member.username}
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
                {(userRole === 'admin' || userRole === 'manager') && (
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
        {(userRole === 'admin' || userRole === 'manager') && (
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
                  <Avatar
                    src={user.profile_picture_url || null}
                    fallbackText={user.full_name}
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
