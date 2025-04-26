import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, ...props }) => {
  return <select {...props} className="border p-2 rounded">{children}</select>;
};

export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value}>{children}</option>
);

export const SelectValue: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
