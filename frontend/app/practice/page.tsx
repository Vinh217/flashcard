'use client';

import { useState, useEffect } from 'react';
import Flashcard from '../components/practice/Flashcard';
import api from '@/lib/axios';
import { Topic, Vocabulary } from '@/types/api';
import Loading from '@/app/components/Loading';
import { Button } from '../components/ui/button';

export default function PracticePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load topics
  useEffect(() => {
    api.get<Topic[]>('/api/topics')
      .then(data => {
        setTopics(data);
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
        }
      })
      .catch(() => {
        setError("Lỗi tải danh sách chủ đề");
      });
  }, []);

  // Load vocabulary when topic changes
  useEffect(() => {
    if (!selectedTopicId) return;
    
    setLoading(true);
    setError("");
    setCurrentIndex(0);
    
    const url = selectedTopicId === 'all' 
      ? '/api/vocabulary'
      : `/api/vocabulary?topicId=${selectedTopicId}`;
      
    api.get<Vocabulary[]>(url)
      .then(data => {
        setVocabulary(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Lỗi tải dữ liệu từ vựng");
        setLoading(false);
      });
  }, [selectedTopicId]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
  };
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
  };
  
  const handleRandom = () => {
    if (vocabulary.length > 1) {
      const arr = [...vocabulary];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setVocabulary(arr);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [vocabulary]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start bg-bubble-gradient px-4 py-8 md:px-8 overflow-hidden">
      {/* Animated bubbles background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute bg-bubble-pink opacity-20 rounded-full w-72 h-72 left-[-6rem] top-[-6rem] animate-float" />
        <div className="absolute bg-bubble-blue opacity-10 rounded-full w-96 h-96 right-[-8rem] top-20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bg-accent opacity-10 rounded-full w-40 h-40 left-1/2 bottom-[-4rem] animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative w-full max-w-2xl z-10">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-white drop-shadow-lg tracking-tight animate-float">Practice Flashcards</h1>
        {/* Tab topic */}
        <div className="topic-scroll mb-6 w-full max-w-xl mx-auto">
          <Button
            key="all"
            variant={selectedTopicId === 'all' ? 'bubble' : 'outline'}
            onClick={() => setSelectedTopicId('all')}
            className={`w-full whitespace-nowrapwhitespace-nowrap mr-2 ${selectedTopicId === 'all' ? 'shadow-neon' : ''}`}
            type="button"
            title="Tổng hợp"
          >
            Tổng hợp
          </Button>
          {topics.map((topic) => (
            <Button
              key={topic.id}
              variant={selectedTopicId === topic.id ? 'bubble' : 'outline'}
              onClick={() => setSelectedTopicId(topic.id)}
              className={`w-full whitespace-nowrap mr-2 ${selectedTopicId === topic.id ? 'shadow-neon' : ''}`}
              type="button"
              title={topic.name}
            >
              {topic.name}
            </Button>
          ))}
        </div>
        {/* Flashcard */}
        <div className="flex justify-center mb-8 w-full">
          <div className="w-full flex justify-center">
            {loading ? (
              <Loading text="Đang tải dữ liệu..." />
            ) : error ? (
              <div className="text-red-400 text-lg font-semibold animate-pulse-fast">{error}</div>
            ) : vocabulary.length > 0 ? (
              <Flashcard
                word={vocabulary[currentIndex].word}
                meaning={vocabulary[currentIndex].meaning}
                topic={vocabulary[currentIndex].topic_name}
                pronunciation={vocabulary[currentIndex].pronunciation}
                synonym={vocabulary[currentIndex].synonym}
                word_family={vocabulary[currentIndex].word_family}
                example={typeof vocabulary[currentIndex].example === 'string' ? vocabulary[currentIndex].example.split('\n') : undefined}
              />
            ) : (
              <p className="text-center text-bubble-light text-lg">Không có từ vựng cho chủ đề này</p>
            )}
          </div>
        </div>
        {/* Navigation buttons + Random */}
        <div className="flex justify-center gap-3 w-full max-w-xs mx-auto mb-2">
          <Button onClick={handlePrevious} className="flex-1" variant="outline" disabled={vocabulary.length === 0 || loading} type="button">
            Previous
          </Button>
          <span className="card-index flex items-center justify-center min-w-[60px] text-bubble-purple font-bold text-lg">
            {vocabulary.length > 0 ? currentIndex + 1 : 0} / {vocabulary.length}
          </span>
          <Button onClick={handleNext} className="flex-1" variant="outline" disabled={vocabulary.length === 0 || loading} type="button">
            Next
          </Button>
        </div>
        <div className="flex justify-center w-full max-w-xs mx-auto mt-2">
          <Button onClick={handleRandom} variant="bubble" className="w-full" disabled={vocabulary.length === 0 || loading} type="button">
            Random
          </Button>
        </div>
      </div>
    </main>
  );
} 