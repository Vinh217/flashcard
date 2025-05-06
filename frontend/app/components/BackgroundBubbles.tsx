import React from 'react';

export default function BackgroundBubbles() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <div className="absolute bg-bubble-pink opacity-30 rounded-full w-72 h-72 left-[-6rem] top-[-6rem] animate-float" />
      <div className="absolute bg-bubble-blue opacity-20 rounded-full w-96 h-96 right-[-8rem] top-20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bg-accent opacity-20 rounded-full w-40 h-40 left-1/2 bottom-[-4rem] animate-float" style={{ animationDelay: '2s' }} />
    </div>
  );
} 