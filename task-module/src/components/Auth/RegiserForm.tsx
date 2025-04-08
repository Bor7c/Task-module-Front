import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="auth-container">
      <h2>Регистрация</h2>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength={4}
            autoComplete="username"
            aria-describedby="username-help"
          />
          <small id="username-help">Минимум 4 символа</small>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            aria-describedby="email-help"
          />
          <small id="email-help">Введите действительный email</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            aria-describedby="password-help"
          />
          <small id="password-help">Минимум 8 символов</small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль:</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            aria-describedby="confirm-password-help"
          />
          <small id="confirm-password-help">Повторите ваш пароль</small>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="auth-footer">
        Уже есть аккаунт? <a href="/login">Войдите</a>
      </div>
    </div>
  );
};

export default RegisterForm;