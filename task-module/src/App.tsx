import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { checkUserSession } from './redux/authSlice';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import TaskDetail from './components/TaskDetail/TaskDetail';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { 
    isAuthenticated, 
    loading, 
    sessionChecked,
    error 
  } = useAppSelector((state) => state.auth);

  // Проверяем сессию при загрузке и при изменении пути
  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    
    // Проверяем сессию только если есть session_id
    if (sessionId) {
      dispatch(checkUserSession());
    } else {
      // Если нет session_id, сразу считаем что не авторизованы
      dispatch({ type: 'auth/checkSession/rejected' });
    }
  }, [dispatch, location.pathname]);

  // Пока не проверили сессию, показываем загрузку
  if (!sessionChecked) {
    return <LoadingScreen fullScreen />;
  }

  // Если идет загрузка (но сессия уже проверена), показываем мини-лоадер
  if (loading) {
    return (
      <Layout>
        <div className="content-loading">
          <LoadingScreen />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )}
        />
        <Route
          path="/register"
          element={isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterPage />
          )}
        />
        <Route
          path="/"
          element={isAuthenticated ? (
            <HomePage />
          ) : (
            <Navigate 
              to="/login" 
              replace 
              state={{ from: location }} 
            />
          )}
        />
        <Route
          path="/tasks/:id"
          element={isAuthenticated ? (
            <TaskDetail />
          ) : (
            <Navigate 
              to="/login" 
              replace 
              state={{ from: location }} 
            />
          )}
        />
        <Route 
          path="*" 
          element={
            <Navigate 
              to={isAuthenticated ? "/" : "/login"} 
              replace 
              state={{ from: location }} 
            />
          } 
        />
      </Routes>
    </Layout>
  );
};

export default App;