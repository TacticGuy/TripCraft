import { useState, useEffect } from 'react';
import './Toast.css';

export function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type} ${isClosing ? 'toast-closing' : ''}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'warning' && '⚠️'}
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setIsClosing(true);
          setTimeout(() => onClose?.(), 300);
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, duration + 300);
  };

  return { toast, showToast, setToast };
}
