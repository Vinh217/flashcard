'use client';

import { useState } from 'react';

interface FlashcardProps {
  word: string;
  meaning: string;
  topic: string;
  pronunciation?: string;
  synonym?: string;
  word_family?: string;
  example?: string[];
}

export default function Flashcard({ word, meaning, topic, pronunciation, synonym, word_family, example }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="flashcard-outer perspective-1000 cursor-pointer select-none border-4 border-primary shadow-2xl hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-bubble-light via-white to-bubble-blue/30"
      onClick={() => setIsFlipped(!isFlipped)}
      title="Click để lật thẻ"
      style={{ boxShadow: '0 8px 32px 0 rgba(162,89,255,0.22), 0 1.5px 6px 0 rgba(56,228,174,0.18)' }}
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center">
          <div className="card-topic text-bubble-dark/50 font-semibold drop-shadow-sm">{topic}</div>
          <div className="card-word text-primary drop-shadow-lg">{word}</div>
          {pronunciation && <div className="text-base text-bubble-purple mb-2 font-medium">{pronunciation}</div>}
          <div className="card-tip text-bubble-pink font-semibold mt-4">Nhấn để xem nghĩa</div>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center rotate-y-180 rounded-3xl border p-4 bg-bubble-light/80" style={{backdropFilter: 'blur(2px)'}}>
          <div className="card-meaning mb-2 text-bubble-dark font-bold text-xl drop-shadow">{meaning}</div>
          {synonym && <div className="text-sm text-blue-700 mb-1"><b>Synonym:</b> {synonym}</div>}
          {word_family && <div className="text-sm text-green-700 mb-1"><b>Word-family:</b> {word_family}</div>}
          {example && example.length > 0 && (
            <div className="text-sm text-gray-700 mt-1">
              <b>Example:</b>
              <ul className="list-disc ml-5">
                {example.map((ex, i) => <li key={i}>{ex}</li>)}
              </ul>
            </div>
          )}
          <div className="card-tip mt-2 text-bubble-pink font-semibold">Nhấn để quay lại</div>
        </div>
      </div>
    </div>
  );
} 