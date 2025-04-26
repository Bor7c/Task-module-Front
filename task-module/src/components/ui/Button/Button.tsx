import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button {...props} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      {children}
    </button>
  );
};
