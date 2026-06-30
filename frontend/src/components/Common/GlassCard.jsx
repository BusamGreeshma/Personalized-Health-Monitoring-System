import React from 'react';

const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel p-6 ${hover ? 'glass-panel-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
