import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '../../types/Types'; // путь подстрой под себя
import "./CreateTeamModal.css"

interface CreateTeamModalProps {
    open: boolean;
    onClose: () => void;
    onTeamCreated: (team: any) => void;
  }
  
  const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ open, onClose, onTeamCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
  
    useEffect(() => {
      if (open) fetchUsers();
    }, [open]);
  
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>('/api/users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
      }
    };
  
    const getDisplayName = (user: User) =>
      `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.trim() || user.username;
  
    const filteredUsers = users.filter(user =>
      getDisplayName(user).toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    );
  
    const toggleUser = (id: number) => {
      setSelectedUserIds(prev =>
        prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
      );
    };
  
    const handleCreate = async () => {
      if (!name.trim()) return;
      setIsLoading(true);
  
      try {
        const response = await axios.post('/api/teams/', {
          name,
          description,
          members_ids: selectedUserIds,
        });
        onTeamCreated(response.data);
        handleClose();
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
      setSearch('');
      setSelectedUserIds([]);
      onClose();
    };
  
    if (!open) return null;

    return (
      <div className="create-team-modal-overlay">
        <div className="create-team-container">
          <h2>Создать новую команду</h2>
    
          <input
            type="text"
            placeholder="Название команды"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
    
          <input
            type="text"
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
    
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
    
          <div className="user-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <label key={user.id}>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  {getDisplayName(user)} ({user.email})
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500">Ничего не найдено</p>
            )}
          </div>
    
          <div className="button-group">
            <button className="button-cancel" onClick={handleClose}>
              Отмена
            </button>
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