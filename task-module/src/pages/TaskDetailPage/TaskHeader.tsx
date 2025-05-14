import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isReadOnly: boolean;
  localStatus: string;
  handleStatusChange: (status: any) => void;
  isAwaitingMenuOpen: boolean;
  setIsAwaitingMenuOpen: (open: boolean) => void;
  awaitingMenuRef: React.RefObject<HTMLDivElement | null>;
  showCloseConfirmation: boolean;
  cancelCloseTask: () => void;
  confirmCloseTask: () => void;
  closeConfirmationRef: React.RefObject<HTMLDivElement | null>;
  navigate: ReturnType<typeof useNavigate>;
  isAdmin: boolean;
  handleDeleteTask: () => void;
}

const TaskHeader: React.FC<HeaderProps> = ({
  isReadOnly, localStatus, handleStatusChange, isAwaitingMenuOpen, setIsAwaitingMenuOpen, awaitingMenuRef,
  showCloseConfirmation, cancelCloseTask, confirmCloseTask, closeConfirmationRef, navigate, isAdmin, handleDeleteTask
}) => (
  <>
    <div className="task-detail__header">
      {/* Кнопка "Назад", которая возвращает на предыдущую страницу */}
      <button onClick={() => navigate(-1)} className="task-detail__back-btn">
        <FaArrowLeft /> Назад
      </button>
      <div className="task-detail__action-buttons">
        {!isReadOnly && localStatus !== 'in_progress' && (
          <button onClick={() => handleStatusChange('in_progress')}
            className="task-detail__status-btn task-detail__in-progress-btn">
            {localStatus === 'solved' ? 'Возобновить работу' : 'Взять в работу'}
          </button>
        )}
        {!isReadOnly && (
          <div className="task-detail__dropdown-container" ref={awaitingMenuRef}>
            <button
              onClick={() => setIsAwaitingMenuOpen(!isAwaitingMenuOpen)}
              className="task-detail__status-btn task-detail__awaiting-btn"
            >Ожидание</button>
            {isAwaitingMenuOpen && (
              <div className="task-detail__dropdown-menu">
                <button onClick={() => handleStatusChange('awaiting_action')} className="task-detail__dropdown-item">Ожидает действий</button>
                <button onClick={() => handleStatusChange('awaiting_response')} className="task-detail__dropdown-item">Ожидает ответа</button>
              </div>
            )}
          </div>
        )}
        {!isReadOnly && localStatus !== 'solved' && (
          <button onClick={() => handleStatusChange('solved')}
            className="task-detail__status-btn task-detail__solved-btn">Решено</button>
        )}
        {!isReadOnly && localStatus === 'solved' && (
          <button onClick={() => handleStatusChange('closed')}
            className="task-detail__status-btn task-detail__closed-btn">Закрыть</button>
        )}
        {/* Кнопка удаления — только для админа */}
        {isAdmin && (
          <button onClick={handleDeleteTask} className="task-detail__status-btn task-detail__delete-btn">
            Удалить задачу
          </button>
        )}
      </div>
    </div>
    {showCloseConfirmation && (
      <div className="task-detail__modal-overlay">
        <div className="task-detail__modal-dialog" ref={closeConfirmationRef}>
          <h3>Подтверждение закрытия</h3>
          <p>Вы уверены, что хотите закрыть задачу? Это действие нельзя будет отменить.</p>
          <div className="task-detail__modal-actions">
            <button onClick={cancelCloseTask} className="task-detail__modal-cancel">Отмена</button>
            <button onClick={confirmCloseTask} className="task-detail__modal-confirm">Подтвердить</button>
          </div>
        </div>
      </div>
    )}
  </>
);

export default TaskHeader;
