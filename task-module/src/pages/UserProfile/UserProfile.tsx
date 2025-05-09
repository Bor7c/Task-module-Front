import React, { useRef, useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { updateUserProfilePicture, deleteUserProfilePicture, updateUserInfo } from '../../api/usersApi';
import { checkUserSession } from '../../redux/authSlice';
import { updateUser } from '../../redux/usersSlice';
import './UserProfile.css';

// Типизируй UserRole отдельно или импортируй из types.ts
type UserRole = 'admin' | 'manager' | 'developer';

const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'developer', label: 'Разработчик' },
];

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [form, setForm] = useState<{
    first_name: string;
    last_name: string;
    middle_name: string;
    username: string;
    email: string;
    role: UserRole;
    is_active: boolean;
  }>({
    first_name: '',
    last_name: '',
    middle_name: '',
    username: '',
    email: '',
    role: 'developer',
    is_active: true,
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        middle_name: user.middle_name || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'developer',
        is_active: user.is_active ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!menuVisible) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).classList.contains('profile-picture-container')
      ) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [menuVisible]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 2500);
    return () => clearTimeout(t);
  }, [successMessage]);

  if (!user) return <div className="user-profile">Пользователь не найден</div>;

  const profilePictureUrl =
    user.profile_picture_url && !avatarError
      ? `http://localhost:8000${user.profile_picture_url}`
      : null;

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateUserProfilePicture(file);
      setSuccessMessage('Фото профиля успешно обновлено!');
      await dispatch(checkUserSession());
      setAvatarError(false);
    } catch (err) {
      setError('Ошибка при обновлении фото профиля.');
      console.error(err);
    } finally {
      setLoading(false);
      setMenuVisible(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDeleteProfilePicture = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteUserProfilePicture();
      setSuccessMessage('Фото профиля удалено!');
      await dispatch(checkUserSession());
      setAvatarError(false);
    } catch (err) {
      setError('Ошибка при удалении фото профиля.');
      console.error(err);
    } finally {
      setLoading(false);
      setMenuVisible(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const { name, value, type } = target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateUserInfo(user.id, form); // вызов нового API
      await dispatch(checkUserSession()); // обновляем сессию, чтобы UI перерисовался
      setSuccessMessage('Профиль успешно обновлён!');
      setEditing(false);
    } catch (err) {
      setError('Ошибка при сохранении данных.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-profile">
      <h1>Профиль пользователя</h1>
      <div className="user-profile-info">
        <div
          className="profile-picture-container"
          onClick={() => setMenuVisible((v) => !v)}
          tabIndex={0}
        >
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="profile-picture"
              onError={() => setAvatarError(true)}
              draggable={false}
            />
          ) : (
            <div className="profile-placeholder">
              <span>{form.first_name ? form.first_name[0] : form.username[0]}</span>
            </div>
          )}
          <div className="profile-picture-overlay">Изменить</div>
        </div>

        <div className="user-details">
          {editing ? (
            <>
              <label>
                Имя:
                <input name="first_name" value={form.first_name} onChange={handleInputChange} />
              </label>
              <label>
                Фамилия:
                <input name="last_name" value={form.last_name} onChange={handleInputChange} />
              </label>
              <label>
                Отчество:
                <input name="middle_name" value={form.middle_name} onChange={handleInputChange} />
              </label>
              <label>
                Логин:
                <input name="username" value={form.username} onChange={handleInputChange} />
              </label>
              <label>
                Email:
                <input name="email" type="email" value={form.email} onChange={handleInputChange} />
              </label>
              {/* <label>
                Роль:
                <select name="role" value={form.role} onChange={handleInputChange}>
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label> */}
              {/* <label>
                Активный:
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleInputChange}
                />
              </label> */}
              <button className="save-button" onClick={handleSaveChanges} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button className="cancel-button" onClick={() => setEditing(false)}>Отмена</button>
            </>
          ) : (
            <>
              <p><strong>Имя:</strong> {form.first_name}</p>
              <p><strong>Фамилия:</strong> {form.last_name}</p>
              <p><strong>Отчество:</strong> {form.middle_name}</p>
              <p><strong>Логин:</strong> {form.username}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Роль:</strong> {roleOptions.find((r) => r.value === user.role)?.label}</p>
              {/* <p><strong>Активный:</strong> {user.is_active ? 'Да' : 'Нет'}</p> */}
              <button className="edit-button" onClick={() => setEditing(true)}>Изменить</button>
            </>
          )}
        </div>
      </div>

      {menuVisible && (
        <div className="profile-menu" ref={menuRef}>
          <button className="menu-button" onClick={() => inputRef.current?.click()}>
            {profilePictureUrl ? 'Загрузить новое фото' : 'Загрузить фото'}
          </button>
          {profilePictureUrl && (
            <button className="menu-button" onClick={handleDeleteProfilePicture}>
              Удалить фото
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="upload-input"
            tabIndex={-1}
          />
        </div>
      )}

      <div className="profile-messages">
        {loading && <span className="loading-message">Загрузка...</span>}
        {error && <span className="error-message">{error}</span>}
        {successMessage && <span className="success-message">{successMessage}</span>}
      </div>
    </div>
  );
};

export default UserProfile;
