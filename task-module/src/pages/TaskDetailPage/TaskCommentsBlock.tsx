import React from 'react';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { Comment, User } from '../../types/Types';

interface TaskCommentsBlockProps {
  comments: Comment[];
  newComment: string;
  setNewComment: (v: string) => void;
  handleAddComment: () => void;
  editingCommentId: number | null;
  setEditingCommentId: (id: number | null) => void;
  editedCommentText: string;
  setEditedCommentText: (v: string) => void;
  handleEditComment: (comment: Comment) => void;
  handleSaveComment: () => void;
  handleDeleteComment: (id: number) => void;
  isReadOnly: boolean;
  currentUser: User | null;
}

const TaskCommentsBlock: React.FC<TaskCommentsBlockProps> = ({
  comments, newComment, setNewComment, handleAddComment, editingCommentId,
  setEditingCommentId, editedCommentText, setEditedCommentText,
  handleEditComment, handleSaveComment, handleDeleteComment, isReadOnly, currentUser
}) => (
  <div className="task-detail__comment-section">
    <h2>Комментарии ({comments.filter(c => !c.is_deleted).length})</h2>
    <div className="task-detail__add-comment">
      <textarea
        placeholder="Добавить комментарий..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        className="task-detail__comment-textarea"
        disabled={isReadOnly}
      />
      <button onClick={handleAddComment} className="task-detail__comment-btn" disabled={!newComment.trim() || isReadOnly}>Добавить комментарий</button>
    </div>
    <div className="task-detail__comments-list">
      {comments
        .filter(c => !c.is_deleted)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(comment => (
          <div key={comment.id} className="task-detail__comment-card">
            <div className="task-detail__comment-header">
              <div className="task-detail__comment-author">
                <p className="task-detail__author-name">{comment.author.full_name}</p>
                <p className="task-detail__comment-meta">
                  {comment.is_modified && !comment.is_system && (<span className="task-detail__modified-badge">изменен</span>)}
                  <span className="task-detail__comment-date">{new Date(comment.updated_at).toLocaleString("ru-RU")}</span>
                </p>
              </div>
              {comment.author.id === currentUser?.id && !isReadOnly && (
                <div className="task-detail__comment-actions">
                  <button onClick={() => handleEditComment(comment)} className="task-detail__edit-comment-btn"><FaEdit /></button>
                  <button onClick={() => handleDeleteComment(comment.id)} className="task-detail__delete-comment-btn"><FaTrash /></button>
                </div>
              )}
            </div>
            <div className="task-detail__comment-body">
              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    value={editedCommentText}
                    onChange={e => setEditedCommentText(e.target.value)}
                    className="task-detail__edit-comment-textarea"
                    disabled={isReadOnly}
                  />
                  <button onClick={handleSaveComment} className="task-detail__save-comment-btn" disabled={isReadOnly}><FaSave /> Сохранить</button>
                  <button onClick={() => setEditingCommentId(null)} className="task-detail__cancel-btn" style={{marginLeft: 8}}>Отмена</button>
                </>
              ) : (
                <p>{comment.text}</p>
              )}
            </div>
          </div>
        ))}
      {comments.filter(c => !c.is_deleted).length === 0 && (
        <p className="task-detail__no-comments">Нет комментариев</p>
      )}
    </div>
  </div>
);
export default TaskCommentsBlock;