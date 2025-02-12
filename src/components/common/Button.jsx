import React from 'react';

function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseClasses = 'btn hover-scale';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline-primary'
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button; 