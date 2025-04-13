import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { checkUserSession, logoutUser } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';

import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Периодически проверяем сессию (например, каждые 5 минут)
    const interval = setInterval(() => {
      dispatch(checkUserSession());
    }, 300000); // 5 минут

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logoutUser());
      navigate('/login');
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <h1>Simple Task Manager</h1>
        {isAuthenticated && (
          <div className="user-panel">
            <span className="username">{user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          </div>
        )}
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;