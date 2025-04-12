import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/store';
import { registerUser } from '../../redux/authSlice';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация на клиенте
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (formData.username.length < 4) {
      setError('Имя пользователя должно содержать минимум 4 символа');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(
        registerUser({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      ).unwrap();
      
      if (result) {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      {error && (
        <div className="error-message" role="alert">
          {error.split(';').map((msg, i) => (
            <p key={i}>{msg.trim()}</p>
          ))}
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
          <small id="confirm-password-help">Пароли должны совпадать</small>
        </div>
        
        <button 
          type="submit" 
          className="register-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      <div className="login-link">
        Уже есть аккаунт? <a href="/login">Войдите</a>
      </div>
    </div>
  );
};

export default RegisterPage;