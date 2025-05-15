import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setTitle, setDescription, setPriority, setDeadline, resetForm } from '../../redux/createTaskFormSlice';
import { createTask } from '../../api/tasksAddAPI';
import { getAllTeams } from '../../redux/teamsSlice'; // Импортируйте метод для получения всех команд
import { useNavigate } from 'react-router-dom';
import './CreateTaskPage.css';

const CreateTaskPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { title, description, priority, deadline } = useAppSelector(state => state.createTaskForm);

  // Извлекаем состояние команд из Redux
  const { list: teams, loading: teamsLoading, error: teamsError } = useAppSelector(state => state.teams);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка команд через Redux
    dispatch(getAllTeams());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!title.trim()) {
      setError('Название задачи не может быть пустым');
      return;
    }
  
    if (!selectedTeam) {
      setError('Пожалуйста, выберите команду');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      await createTask({
        title,
        description,
        priority,
        deadline: deadline || undefined,
        team_id: selectedTeam,
      });
      dispatch(resetForm());
      navigate(-1); // Редирект на предыдущую страницу
    } catch (err: any) {
      console.error('Ошибка при создании задачи:', err);
      setError(err.response?.data?.detail || 'Ошибка при создании задачи. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleGoBack = () => {
    navigate(-1);
  };

  const getPriorityClass = () => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      case 'critical': return 'priority-critical';
      default: return 'priority-medium';
    }
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  };
  

  // Обработка ошибок при загрузке команд
  if (teamsError) {
    return <div>Ошибка при загрузке команд: {teamsError}</div>;
  }

  // Показ загрузки команд
  if (teamsLoading) {
    return <div>Загрузка команд...</div>;
  }

  return (
    <div className="create-task-container">
      <h2 className="create-task-title">Создать новую задачу</h2>

      <form onSubmit={handleSubmit} className="create-task-form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Название задачи</label>
          <input
            id="title"
            className="input-field"
            type="text"
            placeholder="Введите название задачи"
            value={title}
            onChange={(e) => dispatch(setTitle(e.target.value))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Описание задачи</label>
          <textarea
            id="description"
            className="input-field"
            placeholder="Введите подробное описание задачи"
            value={description}
            onChange={(e) => dispatch(setDescription(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Приоритет
            <span className={`priority-indicator ${getPriorityClass()}`}></span>
          </label>
          <select
            id="priority"
            className="priority-select"
            value={priority}
            onChange={(e) => dispatch(setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical'))}
          >
            <option value="low">Низкий приоритет</option>
            <option value="medium">Средний приоритет</option>
            <option value="high">Высокий приоритет</option>
            <option value="critical">Критический</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="deadline" className="form-label">
            Срок выполнения
            <span className="optional-badge">Необязательно</span>
          </label>
          <input
            id="deadline"
            className="input-field date-input"
            type="datetime-local"
            value={formatDateForInput(deadline)}
            onChange={(e) => dispatch(setDeadline(e.target.value ? new Date(e.target.value).toISOString() : null))}
            min={new Date().toISOString().slice(0, 16)}
          />
          <small className="field-hint">Выберите дату и время завершения задачи</small>
        </div>

        <div className="form-group">
          <label htmlFor="team" className="form-label">Команда</label>
          <select
            id="team"
            className="input-field"
            value={selectedTeam ?? ''}
            onChange={(e) => setSelectedTeam(Number(e.target.value))}
            required
          >
            <option value="" disabled>Выберите команду</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="action-buttons">
          <button type="submit" className="create-button" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? 'Создание...' : 'Создать задачу'}
          </button>
          <button
            type="button"
            className="back-button"
            onClick={handleGoBack}
            disabled={loading}
          >
            Назад
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
