'use client';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({
  className = '',
  type = 'text',
  ...props
}: InputProps) {
  const classes = [
    'flex h-12 w-full rounded-2xl border-2 border-bubble-blue bg-surface px-4 py-2 text-base shadow-bubble',
    'placeholder:text-bubble-purple',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:border-primary',
    'transition-all duration-200',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className
  ].join(' ');

  return (
    <input
      type={type}
      className={classes}
      {...props}
    />
  );
} 