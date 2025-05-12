import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './DropMultiselect.css';

type Option = { value: string; label: string };

type DropMultiSelectProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxVisibleOptions?: number;
};

export const DropMultiSelect: React.FC<DropMultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  maxVisibleOptions = 7,
}) => {
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        controlRef.current &&
        !controlRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const rect = controlRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownStyle({
        position: 'absolute',
        top: rect.bottom + window.scrollY + 2,
        left: rect.left + window.scrollX,
        width: rect.width,
        maxHeight: `${maxVisibleOptions * 36}px`,
        zIndex: 9999,
      });
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [open, maxVisibleOptions]);

  const handleOptionClick = (v: string) => {
    onChange(value.includes(v) ? value.filter(val => val !== v) : [...value, v]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = options
    .filter(opt => value.includes(opt.value))
    .map(opt => opt.label);

  const dropdown = open ? (
    ReactDOM.createPortal(
      <div className="dms-dropdown" ref={dropdownRef} style={dropdownStyle}>
        {options.map(opt => (
          <label
            key={opt.value}
            className={`dms-option${value.includes(opt.value) ? ' dms-option--selected' : ''}`}
            title={opt.label}
          >
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => handleOptionClick(opt.value)}
              tabIndex={-1}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <div
        className={`dms-container dms-control ${open ? 'dms-control--open' : ''} ${className}`}
        ref={controlRef}
        tabIndex={0}
        onClick={() => setOpen(s => !s)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setOpen(s => !s);
            e.preventDefault();
          }
        }}
        title={selectedLabels.join(', ') || placeholder}
      >
        <span className="dms-placeholder">
          {selectedLabels.length
            ? <>
                {selectedLabels.slice(0, 3).join(', ')}
                {selectedLabels.length > 3 ? ` +${selectedLabels.length - 3}` : ''}
              </>
            : placeholder || 'Выбрать'}
        </span>
        {selectedLabels.length > 0 && (
          <span className="dms-clear" onClick={handleClear}>×</span>
        )}
        <span className={`dms-arrow ${open ? 'dms-arrow--up' : ''}`}>▼</span>
      </div>
      {dropdown}
    </>
  );
};
