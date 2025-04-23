import React, { useState } from 'react';
import { Comment, Task } from '../../../types/Task';
import { User } from '../../../types/User';
import './TaskComments.css';

type TaskCommentsProps = {
  task: Task;
  user: User | null;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: number) => void;
  onEditComment: (commentId: number, text: string) => void;
};

const TaskComments: React.FC<TaskCommentsProps> = ({ 
  task, 
  user, 
  onAddComment, 
  onDeleteComment, 
  onEditComment 
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const startCommentEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.text);
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText('');
  };

  const saveCommentEdit = () => {
    if (!editingCommentId || !editedCommentText.trim()) return;
    onEditComment(editingCommentId, editedCommentText);
    cancelCommentEdit();
  };

  const renderComment = (comment: Comment) => {
    if (editingCommentId === comment.id) {
      return (
        <div key={comment.id} className="comment-edit">
          <textarea
            value={editedCommentText}
            onChange={(e) => setEditedCommentText(e.target.value)}
            rows={3}
            className="comment-edit-textarea"
          />
          <div className="comment-edit-actions">
            <button 
              onClick={saveCommentEdit}
              disabled={!editedCommentText.trim()}
              className="btn btn-primary btn-sm"
            >
              Сохранить
            </button>
            <button 
              onClick={cancelCommentEdit} 
              className="btn btn-outline-secondary btn-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={comment.id} className={`comment ${comment.is_system ? 'system' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <span className="author-avatar">
              {comment.author.username.charAt(0).toUpperCase()}
            </span>
            <div className="author-info">
              <span className="author-name">{comment.author.username}</span>
              {comment.is_system && <span className="system-tag">Системное</span>}
              <span className="comment-date">
                {new Date(comment.created_at).toLocaleString()}
                {comment.is_modified && ' (изменено)'}
              </span>
            </div>
          </div>
          
          {!comment.is_system && user?.id === comment.author.id && (
            <div className="comment-actions">
              <button
                onClick={() => startCommentEdit(comment)}
                className="btn btn-outline-primary btn-sm"
                title="Редактировать"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="btn btn-outline-danger btn-sm"
                title="Удалить"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          )}
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>
    );
  };

  return (
    <div className="comments-section">
      <div className="section-header">
        <h2>Комментарии</h2>
        <span className="comment-count">{task.comments?.length || 0}</span>
      </div>
      
      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Напишите ваш комментарий здесь..."
          rows={4}
        />
        <button 
          onClick={handleAddComment}
          disabled={!newComment.trim()}
        >
          Отправить комментарий
        </button>
      </div>

      <div className="comments-list">
        {task.comments?.length ? (
          task.comments.map(renderComment)
        ) : (
          <div className="no-comments">
            <i className="icon-comment"></i>
            <p>Пока нет комментариев</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskComments;