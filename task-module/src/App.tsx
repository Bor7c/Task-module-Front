import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/store';
import { checkUserSession } from './redux/authSlice';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import TaskDetail from './pages/TaskPage/TaskDetail';
import CreateTaskPage from './pages/CreateTaskPage/CreateTaskPage'; // 👈 Новый импорт
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

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      dispatch(checkUserSession());
    } else {
      dispatch({ type: 'auth/checkSession/rejected' });
    }
  }, [dispatch, location.pathname]);

  if (!sessionChecked) {
    return <LoadingScreen fullScreen />;
  }

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
        {/* Новый роут для создания задачи */}
        <Route
          path="/create-task"
          element={isAuthenticated ? (
            <CreateTaskPage />
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
