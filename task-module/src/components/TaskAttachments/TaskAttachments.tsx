import React, { useState, useEffect } from 'react';
import { FaPaperclip, FaTimes, FaTrash } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { 
    fetchAttachments, 
    uploadAttachments, 
    removeAttachment,
    setUploadProgress,
    clearAttachments
} from '../../redux/attachmentsSlice';
import { Attachment } from '../../types/Types';
import './TaskAttachments.css';

interface TaskAttachmentsProps {
    taskId: number;
    taskStatus: string;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId, taskStatus }) => {
    const dispatch = useAppDispatch();
    const { attachments, loading, error, uploadProgress } = useAppSelector((state) => state.attachments);
    const currentUser = useAppSelector((state) => state.auth.user);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loadedForTask, setLoadedForTask] = useState<number | null>(null); // контролируем id

    const isReadOnly = taskStatus === 'closed';

    useEffect(() => {
        // Сначала ОЧИЩАЕМ вложения, а только потом грузим новые!
        dispatch(clearAttachments());
        setLoadedForTask(null);

        // Затем грузим вложения для нового taskId
        if (taskId) {
            dispatch(fetchAttachments(taskId)).then(() => setLoadedForTask(taskId));
        }

        // Лучше сбрасывать при размонтировании, на всякий случай:
        return () => {
            dispatch(clearAttachments());
            setLoadedForTask(null);
        };
    }, [taskId, dispatch]);

    const canDeleteAttachment = (attachment: Attachment) => {
        if (!currentUser || isReadOnly) return false;
        return currentUser.id === attachment.uploaded_by?.id;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && !isReadOnly) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeSelectedFile = (index: number) => {
        if (!isReadOnly) {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleUpload = () => {
        if (!isReadOnly && selectedFiles.length > 0) {
            dispatch(uploadAttachments({ taskId, files: selectedFiles }))
                .unwrap()
                .then(() => {
                    setSelectedFiles([]);
                });
        }
    };

    const handleDelete = (attachmentId: number) => {
        if (!isReadOnly && window.confirm('Вы уверены, что хотите удалить это вложение?')) {
            dispatch(removeAttachment(attachmentId));
        }
    };

    // ПОКАЗЫВАЕМ вложения только если загрузили для актуальной задачи и не грузим/ошибку
    const showRealAttachments = taskId === loadedForTask && !loading && !error;

    return (
        <div className="task-attachments">
            <h3>Вложения ({showRealAttachments ? attachments.length : '...'})</h3>
            {error && <div className="error-message">{error}</div>}
            <div className="attachments-list">
                {!showRealAttachments ? (
                    <div className="attachments-loading">Загрузка вложений...</div>
                ) : (
                    attachments.map(attachment => (
                        <div key={attachment.id} className="attachment-item">
                            <div className="attachment-info">
                                <FaPaperclip className="attachment-icon" />
                                <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-link"
                                >
                                    {attachment.filename}
                                </a>
                                <span className="attachment-meta">
                                    {new Date(attachment.uploaded_at).toLocaleDateString()}
                                    {attachment.uploaded_by && (
                                        <span className="uploaded-by">
                                            {attachment.uploaded_by.username}
                                        </span>
                                    )}
                                </span>
                            </div>
                            {canDeleteAttachment(attachment) && (
                                <button
                                    onClick={() => handleDelete(attachment.id)}
                                    className="attachment-delete-btn"
                                    title="Удалить вложение"
                                    disabled={loading}
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
            {!isReadOnly && (
                <div className="file-upload-section">
                    <div className="file-input-container">
                        <label className="file-input-label">
                            <FaPaperclip />
                            <span>Добавить файлы</span>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="file-input"
                                disabled={loading}
                            />
                        </label>
                    </div>
                    {selectedFiles.length > 0 && (
                        <div className="selected-files">
                            <h4>Выбранные файлы:</h4>
                            <ul>
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="selected-file-item">
                                        <span>{file.name}</span>
                                        <button
                                            onClick={() => removeSelectedFile(index)}
                                            className="remove-file-btn"
                                            disabled={loading}
                                        >
                                            <FaTimes />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleUpload}
                                disabled={loading || selectedFiles.length === 0}
                                className="upload-button"
                            >
                                {loading ? 'Загрузка...' : 'Загрузить'}
                            </button>
                            {uploadProgress > 0 && (
                                <div className="upload-progress">
                                    <progress value={uploadProgress} max="100" />
                                    <span>{uploadProgress}%</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskAttachments;