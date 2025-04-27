import React from 'react';
import './Button.css';  // Подключим файл стилей

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <button {...props} className={`custom-btn ${className}`}>
      {children}
    </button>
  );
};
