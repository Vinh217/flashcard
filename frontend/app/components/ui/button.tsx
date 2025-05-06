'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'bubble';
}

export function Button({ 
  className = '', 
  children, 
  variant = 'default', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-bubble cursor-pointer';
  
  const variantClasses = {
    default: 'bg-gradient-to-br from-primary to-bubble-blue text-white hover:from-bubble-pink hover:to-primary/90 h-12 px-6 py-2 shadow-bubble hover:scale-105 active:scale-95',
    outline: 'border-2 border-primary bg-surface text-primary hover:bg-bubble-light hover:border-bubble-blue h-12 px-6 py-2',
    bubble: 'bg-bubble-pink text-white shadow-bubble h-12 px-8 py-2 hover:bg-bubble-blue hover:shadow-neon',
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
} 