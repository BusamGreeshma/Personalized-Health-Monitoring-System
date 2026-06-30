import React from 'react';

const LoadingSkeleton = ({ count = 3, height = "h-8", className = "" }) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={`w-full bg-slate-800/60 rounded-lg ${height}`} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
