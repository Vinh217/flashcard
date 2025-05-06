'use client';

// import Link from 'next/link';
// import { FiUsers, FiList, FiArrowRight } from 'react-icons/fi';
import { Button } from './components/ui/button';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-bubble-gradient overflow-hidden">
      {/* Animated bubbles background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute bg-bubble-pink opacity-30 rounded-full w-72 h-72 left-[-6rem] top-[-6rem] animate-float" />
        <div className="absolute bg-bubble-blue opacity-20 rounded-full w-96 h-96 right-[-8rem] top-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bg-accent opacity-20 rounded-full w-40 h-40 left-1/2 bottom-[-4rem] animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative max-w-3xl w-full text-center z-10">
        <h1 className="text-5xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight animate-float">FlashCard Game 2025</h1>
        <p className="text-xl text-bubble-light mb-12 font-medium animate-pulse-fast">
          Test your vocabulary knowledge with our flashcard game!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <a 
            href="/multiplayer"
            className="bg-bubble-dark/80 p-8 rounded-3xl shadow-bubble hover:shadow-neon transition-all flex flex-col items-center border-2 border-bubble-blue hover:scale-105 active:scale-95 animate-float"
          >
            <div className="h-20 w-20 bg-bubble-blue text-white rounded-full flex items-center justify-center mb-4 shadow-neon animate-bounce-slow">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-5a4 4 0 11-8 0 4 4 0 018 0zm6 4a2 2 0 11-4 0 2 2 0 014 0zm-14 0a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-bubble-blue">Multiplayer Mode</h2>
            <p className="text-bubble-light mb-4">
              Join with friends in real-time to see who knows the most vocabulary!
            </p>
            <Button variant="bubble" className="w-full mt-2">Play Now</Button>
          </a>
          <a 
            href="/practice"
            className="bg-bubble-dark/80 p-8 rounded-3xl shadow-bubble hover:shadow-neon transition-all flex flex-col items-center border-2 border-bubble-pink hover:scale-105 active:scale-95 animate-float"
          >
            <div className="h-20 w-20 bg-bubble-pink text-white rounded-full flex items-center justify-center mb-4 shadow-neon animate-bounce-slow">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-bubble-pink">Practice Mode</h2>
            <p className="text-bubble-light mb-4">
              Practice vocabulary on your own using flashcards to improve your knowledge.
            </p>
            <Button variant="bubble" className="w-full mt-2">Practice Now</Button>
          </a>
        </div>
      </div>
    </main>
  );
}
