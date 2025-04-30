import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAppDispatch } from '../../redux/store';
import { loginUser } from '../../redux/authSlice';
import './Auth.css';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Очистка куки "session_token" при загрузке компонента
  useEffect(() => {
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    if (formData.username.length < 4) {
      setError('Имя пользователя должно содержать минимум 4 символа');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    try {
      const { username, email, password } = formData;
      
      // 1. Регистрация пользователя
      await authAPI.register({ username, email, password });
      
      // 2. Автоматический вход после регистрации
      const result = await dispatch(
        loginUser({ username, password })
      ).unwrap();
      
      if (result) {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.message || 
        'Ошибка регистрации. Возможно, пользователь уже существует.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stm-auth-page">
      <div className="stm-auth-card">
        <div className="stm-auth-header">
          <h1>Simple Task Manager</h1>
          <h2>Регистрация</h2>
          <p className="stm-auth-subtitle">Создайте учетную запись для работы с задачами</p>
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
        <form onSubmit={handleSubmit} className="stm-auth-form" noValidate>
          <div className="stm-form-field">
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Минимум 4 символа"
              required
              minLength={4}
              autoComplete="username"
            />
          </div>
          
          <div className="stm-form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="stm-form-field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 8 символов"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          
          <div className="stm-form-field">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Повторите ваш пароль"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="stm-auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="stm-auth-footer">
          <p>Уже есть аккаунт? <Link to="/login">Войдите</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;