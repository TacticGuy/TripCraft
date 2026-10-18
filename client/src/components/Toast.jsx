import { useState, useEffect, useRef } from 'react';
import './Toast.css';

export function Toast({ message, type = 'info', duration = 5000, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!message) return;
    setIsClosing(false);

    let closeTimer;
    const timer = setTimeout(() => {
      setIsClosing(true);
      closeTimer = setTimeout(() => onCloseRef.current?.(), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [message, duration]);

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
