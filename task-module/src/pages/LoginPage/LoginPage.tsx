import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAppDispatch } from '../../redux/store';
import { loginUser } from '../../redux/authSlice';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Сбрасываем ошибку перед новым запросом

    try {
      // Используем Redux thunk для входа
      const result = await dispatch(loginUser({ username, password })).unwrap();
      
      if (result) {
        navigate('/'); // Перенаправляем после успешного входа
      }
    } catch (err) {
      setError('Неверные учетные данные');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="login-container">
      <h2>Вход в систему</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            aria-describedby="username-help"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            aria-describedby="password-help"
          />
        </div>
        <button type="submit" className="login-button">
          Войти
        </button>
      </form>
      <p className="register-link">
        Нет аккаунта? <a href="/register">Зарегистрируйтесь</a>
      </p>
    </div>
  );
};

export default LoginPage;