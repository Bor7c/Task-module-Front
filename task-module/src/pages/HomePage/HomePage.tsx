import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { authAPI } from '../../api/auth';
import { logoutUser } from '../../redux/authSlice';
import TaskList from '../TaskList/TaskList';
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
      <main>
        <TaskList />
      </main>
    </div>
  );
};

export default HomePage;