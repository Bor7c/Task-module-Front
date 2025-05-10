import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createTeam } from '../../redux/teamsSlice';
import { getAllUsers } from '../../redux/usersSlice';
import './CreateTeamModal.css';

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: (team: any) => void;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ open, onClose, onTeamCreated }) => {
  const dispatch = useAppDispatch();
  const allUsers = useAppSelector((state) => state.users.users);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) dispatch(getAllUsers());
  }, [open, dispatch]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const result = await dispatch(
        createTeam({
          name,
          description: description || '',
          members_ids: selectedUsers,
        })
      );
      if (createTeam.fulfilled.match(result)) {
        onTeamCreated(result.payload);
        handleClose();
      } else {
        alert('Ошибка при создании команды');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при создании команды');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedUsers([]);
    setSearch('');
    onClose();
  };

  const filteredAvailable = allUsers.filter(
    (u) =>
      !selectedUsers.includes(u.id) &&
      (u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.first_name.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedUserObjects = allUsers.filter((u) => selectedUsers.includes(u.id));

  const toggleUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  return (
    <div className="create-team-modal-overlay">
      <div className="create-team-container">
        <h2 className="modal-title">Создать команду</h2>

        <input
          type="text"
          className="modal-input"
          placeholder="Название команды"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          className="modal-input"
          placeholder="Описание (необязательно)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="user-selection-section">
          <div className="user-list">
            <h3>Доступные пользователи</h3>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск по пользователям"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="user-scroll-box">
              {filteredAvailable.map((user) => (
                <div key={user.id} className="user-item" onClick={() => toggleUser(user.id)}>
                  <img
                    src={user.profile_picture_url || '/default-avatar.png'}
                    alt="avatar"
                    className="avatar"
                  />
                  <span>{user.username} ({user.first_name} {user.last_name})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="user-list">
            <h3>Выбранные</h3>
            <div className="user-scroll-box">
              {selectedUserObjects.map((user) => (
                <div key={user.id} className="user-item selected" onClick={() => toggleUser(user.id)}>
                  <img
                    src={user.profile_picture_url || '/default-avatar.png'}
                    alt="avatar"
                    className="avatar"
                  />
                  <span>{user.username} ({user.first_name} {user.last_name})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="button-group">
          <button className="button-cancel" onClick={handleClose}>Отмена</button>
          <button
            className="button-create"
            onClick={handleCreate}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;
