import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { loginUser } from '../../redux/authSlice';
import './LoginPage.css';

interface ErrorPayload {
  message?: string;
  error?: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Валидация
    if (!username.trim() || !password.trim()) {
      setError('Имя пользователя и пароль обязательны');
      return;
    }

    // Сброс куки сессии
    document.cookie = 'session_token=; Max-Age=0; path=/;';

    setError('');
    setIsSubmitting(true);

    try {
      const resultAction = await dispatch(loginUser({ username, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        const redirectTo = (location.state as any)?.from || '/';
        navigate(redirectTo, { replace: true });
      } else if (loginUser.rejected.match(resultAction)) {
        const payload = resultAction.payload as ErrorPayload | undefined;
        const errorMessage = 
          payload?.message || 
          payload?.error || 
          resultAction.error?.message || 
          'Неверные учетные данные';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Произошла непредвиденная ошибка');
      console.error('Ошибка входа:', err);
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
          <div className="auth-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
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
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
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
