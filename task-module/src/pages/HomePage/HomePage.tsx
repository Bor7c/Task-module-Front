import React from 'react';
import { useAppDispatch } from '../../redux/store';
import { authAPI } from '../../api/auth';
import { logoutUser } from '../../redux/authSlice';
import TaskList from '../../components/TaskList/TaskList';
import './HomePage.css';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      // Вызываем logout из authAPI и дожидаемся завершения
      await authAPI.logout();
      
      // Диспатчим действие выхода из Redux
      dispatch(logoutUser());
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  return (
    <div className="home-page">
      <header className="header">
        <h1>Список задач</h1>
        <button 
          onClick={handleLogout} 
          className="logout-button"
          aria-label="Выйти из системы"
        >
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