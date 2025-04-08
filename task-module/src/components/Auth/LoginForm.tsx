import React, { useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { loginUser } from '../../redux/authSlice';
import './Auth.css';

const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Сбрасываем ошибку перед новым запросом
    
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
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
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
          />
        </div>
        <button type="submit" className="auth-button">
          Войти
        </button>
      </form>
    </div>
  );
};

export default LoginForm;