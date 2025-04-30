import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../redux/store';
import { loginUser } from '../../redux/authSlice';
import { Link } from 'react-router-dom';
import './Auth.css';

const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  // Очистка куки "session_token" при загрузке компонента
  useEffect(() => {
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Имя пользователя и пароль обязательны');
      return;
    }
    
    setError(''); // Сбрасываем ошибку перед новым запросом
    setIsSubmitting(true);
    
    try {
      const resultAction = await dispatch(loginUser({ username, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        onLogin(); // Успешный вход
      } else if (loginUser.rejected.match(resultAction)) {
        setError(resultAction.payload as string || 'Неверные учетные данные');
      }
    } catch (err) {
      setError('Произошла ошибка при входе');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stm-auth-page">
      <div className="stm-auth-card">
        <div className="stm-auth-header">
          <h1>Simple Task Manager</h1>
          <h2>Вход в систему</h2>
          <p className="stm-auth-subtitle">Используйте свои учетные данные для входа</p>
        </div>
        {error && (
          <div className="stm-auth-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="stm-auth-form">
          <div className="stm-form-field">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
              autoComplete="username"
              required
            />
          </div>
          
          <div className="stm-form-field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="stm-auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Выполняется вход...' : 'Войти'}
          </button>
        </form>
        <div className="stm-auth-footer">
          <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;