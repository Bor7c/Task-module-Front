import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser } from '../../redux/authSlice';
import './LoginPage.css';
import { authAPI } from '../../api/auth';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translateError = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('invalid credentials')) return 'Неверное имя пользователя или пароль';
    if (lower.includes('user is inactive')) return 'Учетная запись не активна';
    if (lower.includes('login failed')) return 'Ошибка входа. Проверьте введенные данные';
    return message;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Имя пользователя и пароль обязательны');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await authAPI.login({ username, password });

      dispatch(loginUser.fulfilled(result, '', { username, password }));

      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      let errorMessage = 'Произошла ошибка при входе. Попробуйте позже.';
      if (err instanceof Error) {
        errorMessage = translateError(err.message);
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [username, password, dispatch, navigate, location.state]);

  return (
    <div className="auth-wrapper">
      <div className="auth-container login-container">
        <div className="auth-header">
          <h1>Simple Task Manager</h1>
          <h2>Вход в систему</h2>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="red" strokeWidth="2" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ marginLeft: '8px' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Введите имя пользователя"
                disabled={isSubmitting}
                onFocus={() => setError('')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Введите пароль"
                disabled={isSubmitting}
                onFocus={() => setError('')}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" />
                </svg>
                Выполняется вход...
              </>
            ) : 'Войти в систему'}
          </button>
        </form>

        <div className="auth-links">
          <p>Нет аккаунта? <a href="/register" className="auth-link">Зарегистрироваться</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
