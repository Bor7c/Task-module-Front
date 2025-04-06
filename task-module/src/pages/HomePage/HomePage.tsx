import React from 'react';
import { useAppDispatch } from '../../redux/store';
import { logout } from '../../api/auth';
import { logout as logoutAction } from '../../redux/authSlice';
import TaskList from '../../components/TaskList/TaskList';
import './HomePage.css';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('session_token');
      dispatch(logoutAction());
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <h1>Список задач</h1>
        <button onClick={handleLogout} className="logout-button">
          Выйти
        </button>
      </header>
      <main>
        <TaskList />
      </main>
    </div>
  );
};

export default HomePage;