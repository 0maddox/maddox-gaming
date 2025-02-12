import React, { useEffect } from 'react';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast show position-fixed top-0 end-0 m-3 bg-${type === 'success' ? 'primary-blue' : 'danger'}`}>
      <div className="toast-header">
        <strong className="me-auto">{type === 'success' ? 'Success' : 'Error'}</strong>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="toast-body text-white">
        {message}
      </div>
    </div>
  );
}

export default Toast; 