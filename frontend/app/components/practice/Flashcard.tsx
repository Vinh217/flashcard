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
      className="flashcard-outer perspective-1000 cursor-pointer select-none"
      onClick={() => setIsFlipped(!isFlipped)}
      title="Click để lật thẻ"
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center">
          <div className="card-topic">{topic}</div>
          <div className="card-word">{word}</div>
          {pronunciation && <div className="text-base text-gray-500 mb-2">{pronunciation}</div>}
          <div className="card-tip">Nhấn để xem nghĩa</div>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center rotate-y-180 p-4">
          <div className="card-meaning mb-2">{meaning}</div>
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
          <div className="card-tip mt-2">Nhấn để quay lại</div>
        </div>
      </div>
    </div>
  );
} 