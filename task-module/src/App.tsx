import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { checkUserSession } from './redux/authSlice';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import TaskDetail from './pages/TaskDetailPage/TaskDetail';
import CreateTaskPage from './pages/CreateTaskPage/CreateTaskPage';
import UserProfile from './pages/UserProfile/UserProfile';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';
import TeamListPage from './pages/TeamListPage/TeamListPage';
import TeamDetailPage from './pages/TeamDetailPage/TeamDetailPage';
import CreatorTaskList from './pages/CreatorTaskList/CreatorTaskList'; // Новый импорт

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { 
    isAuthenticated, 
    loading, 
    sessionChecked 
  } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      dispatch(checkUserSession());
    } else {
      dispatch({ type: 'auth/checkSession/rejected' });
    }
  }, [dispatch]);

  if (!sessionChecked) {
    return <LoadingScreen fullScreen />;
  }

  return (
    <Routes>
      {/* Роуты без Layout */}
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
      
      {/* Роуты с Layout */}
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/tasks/:id"
          element={
            isAuthenticated ? (
              <TaskDetail />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/create-task"
          element={
            isAuthenticated ? (
              <CreateTaskPage />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/user-profile"
          element={
            isAuthenticated ? (
              <UserProfile />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/creator-task-list"  // Новый маршрут для страницы задач, созданных пользователем
          element={
            isAuthenticated ? (
              <CreatorTaskList />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
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
        <Route
          path="/teams"
          element={
            isAuthenticated ? (
              <TeamListPage />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
        <Route
          path="/teams/:id"
          element={
            isAuthenticated ? (
              <TeamDetailPage />
            ) : (
              <Navigate to="/login" replace state={{ from: location }} />
            )
          }
        />
      </Route>
    </Routes>
  );
};

export default App;
