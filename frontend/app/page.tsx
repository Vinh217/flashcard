'use client';

import Link from 'next/link';
import { FiUsers, FiList, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Flashcard Game</h1>
        <p className="text-lg text-gray-600 mb-12">
          Test your vocabulary knowledge with our flashcard game!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/multiplayer"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center"
          >
            <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <FiUsers size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Multiplayer Mode</h2>
            <p className="text-gray-500 mb-4">
              Join with friends in real-time and compete to see who knows the most vocabulary!
            </p>
            <span className="flex items-center text-blue-500">
              Play Now <FiArrowRight className="ml-2" />
            </span>
          </Link>
          
          <Link 
            href="/practice"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col items-center"
          >
            <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
              <FiList size={24} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Practice Mode</h2>
            <p className="text-gray-500 mb-4">
              Practice vocabulary on your own using flashcards to improve your knowledge.
            </p>
            <span className="flex items-center text-green-500">
              Practice Now <FiArrowRight className="ml-2" />
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
