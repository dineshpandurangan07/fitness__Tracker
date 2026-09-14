import React from 'react';

const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${
        glass ? 'glass-card' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
      } ${
        hoverEffect
          ? 'hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/40 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
