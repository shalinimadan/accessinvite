import React from 'react';

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span aria-hidden="true">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
