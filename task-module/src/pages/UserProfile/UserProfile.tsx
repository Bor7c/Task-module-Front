import React, { useState } from 'react';
import { useAppSelector } from '../../redux/store';
import { updateUserProfilePicture } from '../../api/users';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateUserProfilePicture(file);
      setSuccessMessage('Фото профиля успешно обновлено!');
      // Здесь можно обновить состояние пользователя, если нужно
    } catch (err) {
      setError('Ошибка при обновлении фото профиля.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    // Реализуйте логику удаления фото профиля
    setSuccessMessage('Фото профиля удалено!');
    setMenuVisible(false);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div className="user-profile">
      <h1>Профиль пользователя</h1>
      <div className="user-profile-info">
        <div className="profile-picture-container" onClick={toggleMenu}>
          {user.profile_picture_url ? (
            <img 
              src={user.profile_picture_url} 
              alt="Profile" 
              className="profile-picture" 
            />
          ) : (
            <div className="profile-placeholder">Добавить фото</div>
          )}
        </div>
        <div className="user-details">
          <p><strong>Имя:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Пользовательское имя:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> {user.role}</p>
          <p><strong>Статус:</strong> {user.is_active ? 'Активен' : 'Неактивен'}</p>
        </div>
      </div>
      {menuVisible && (
        <div className="profile-menu">
          {user.profile_picture_url ? (
            <>
              <button 
                className="menu-button" 
                onClick={() => (document.querySelector('.upload-input') as HTMLInputElement)?.click()}
              >
                Редактировать фото
              </button>
              <button className="menu-button" onClick={handleDeleteProfilePicture}>
                Удалить фото
              </button>
            </>
          ) : (
            <button 
              className="menu-button" 
              onClick={() => (document.querySelector('.upload-input') as HTMLInputElement)?.click()}
            >
              Добавить фото
            </button>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleProfilePictureChange} 
            className="upload-input" 
            style={{ display: 'none' }} 
          />
        </div>
      )}
      {loading && <p>Загрузка...</p>}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default UserProfile;
