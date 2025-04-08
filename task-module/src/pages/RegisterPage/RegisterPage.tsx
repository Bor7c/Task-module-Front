import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAppDispatch } from '../../redux/store';
import { loginUser } from '../../redux/authSlice';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Сбрасываем ошибку при изменении полей
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const { username, email, password } = formData;
      // Используем Redux thunk для регистрации и автоматического входа
      const result = await dispatch(
        loginUser({ username, password }) // Предполагаем, что регистрация сразу логинит пользователя
      ).unwrap();
      
      if (result) {
        navigate('/');
      }
    } catch (err) {
      setError('Ошибка регистрации. Возможно, пользователь уже существует.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>
      {error && <div className="error-message" role="alert">{error}</div>}
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
        
        <button type="submit" className="register-button">
          Зарегистрироваться
        </button>
      </form>
      
      <div className="login-link">
        Уже есть аккаунт? <a href="/login">Войдите</a>
      </div>
    </div>
  );
};

export default RegisterPage;