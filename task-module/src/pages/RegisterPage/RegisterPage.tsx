import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { registerUser } from '../../redux/authSlice';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }, []);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const { username, email, password, confirmPassword } = formData;
  
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
  
    if (username.length < 4) {
      setError('Имя пользователя должно содержать минимум 4 символа');
      return;
    }
  
    if (!isValidEmail(email)) {
      setError('Введите корректный email адрес');
      return;
    }
  
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
  
    setIsSubmitting(true);
    setError('');
  
    try {
      await dispatch(registerUser({ username, email, password })).unwrap();
      navigate('/');
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);  // Логируем ошибку для диагностики
  
      const serverMessage = err?.data?.error || err?.data?.message || '';
  
      console.log('Сообщение с сервера:', serverMessage);  // Логируем сообщение с сервера
  
      // Переводим ошибки на русский
      if (serverMessage.includes('Username already exists')) {
        setError('Пользователь с таким именем уже существует');
      } else if (serverMessage.includes('Email already exists')) {
        setError('Пользователь с таким email уже существует');
      } else if (serverMessage.includes('Password is too weak')) {
        setError('Пароль слишком слабый');
      } else if (serverMessage.toLowerCase().includes('already exists')) {
        setError('Пользователь с таким именем или email уже существует');
      } else if (serverMessage) {
        setError(serverMessage);  // Для всех других ошибок
      } else {
        setError('Произошла ошибка регистрации');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  

  return (
    <div className="auth-wrapper">
      <div className="auth-container register-container">
        <div className="auth-header">
          <h1>Simple Task Manager</h1>
          <h2>Регистрация</h2>
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
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
                placeholder="Введите имя пользователя"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="Введите email"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Введите пароль"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Подтверждение пароля</label>
            <div className="input-wrapper">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Повторите пароль"
                disabled={isSubmitting}
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
                Создание аккаунта...
              </>
            ) : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="auth-links">
          <p>Уже есть аккаунт? <a href="/login" className="auth-link">Войти в систему</a></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
