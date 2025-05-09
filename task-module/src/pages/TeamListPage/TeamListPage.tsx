import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { getTeams, deleteTeam } from '../../redux/teamsSlice';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../../components/common/LoadingScreen';
import CreateTeamModal from '../../components/CreateTeamModal/CreateTeamModal';
import './TeamList.css';

const TeamListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, loading } = useAppSelector(state => state.teams);
  const userRole = useAppSelector(state => state.auth.user?.role);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(getTeams());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить эту команду?')) {
      dispatch(deleteTeam(id));
    }
  };

  const handleNavigate = (id: number) => {
    navigate(`/teams/${id}`);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleTeamCreated = (newTeam: any) => {
    dispatch(getTeams());
    setIsModalOpen(false);
  };

  return (
    <div className="task-list">
      <div className="task-list__title">
        <h1>Список команд</h1>
        {userRole === 'admin' && (
          <button className="task-list__create-btn" onClick={handleOpenModal}>
            + Добавить команду
          </button>
        )}
      </div>

      {loading ? (
        <LoadingScreen />
      ) : (
        <div className="team-list__cards">
          {list.map((team: any) => (
            <div
              key={team.id}
              className="team-list__card"
              onClick={() => handleNavigate(team.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(team.id)}
            >
              <div className="team-list__card-content">
                <div className="team-list__card-name">{team.name}</div>
                <div className="team-list__card-description">{team.description || 'Нет описания'}</div>
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(team.id);
                  }}
                  className="team-list__card-delete"
                  title="Удалить команду"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модалка */}
      <CreateTeamModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
};

export default TeamListPage;
