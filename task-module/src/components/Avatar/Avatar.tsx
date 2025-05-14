import React, { useEffect, useState } from 'react';
import './Avatar.css'; // Создаём простые стили, если надо

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, fallbackText, className }) => {
    const [error, setError] = useState(false);
  
    // Сброс ошибки, если src меняется
    useEffect(() => {
      setError(false);
    }, [src]);
  
    if (!src || error) {
      return (
        <div className={`avatar-fallback ${className || ''}`}>
          {fallbackText.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <img
        src={src}
        alt={alt || 'avatar'}
        className={`avatar-image ${className || ''}`}
        onError={() => setError(true)}
      />
    );
  };
  export default Avatar;
