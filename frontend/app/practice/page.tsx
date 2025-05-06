'use client';

import { useState, useEffect } from 'react';
import Flashcard from '../components/practice/Flashcard';
import api from '@/lib/axios';
import { Topic, Vocabulary } from '@/types/api';
import Loading from '@/app/components/Loading';

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
    <main className="min-h-screen flex flex-col items-center justify-start bg-gray-50 px-4 py-4 md:px-8">
      <h1 className="text-2xl font-bold text-center mb-4 mt-2 tracking-tight">TOEIC Vocabulary Flashcards</h1>
      
      {/* Tab topic */}
      <div className="topic-scroll mb-4 w-full max-w-md mx-auto">
        <button
          key="all"
          onClick={() => setSelectedTopicId('all')}
          className={`topic-btn max-w-[120px] truncate overflow-hidden whitespace-nowrap ${selectedTopicId === 'all' ? "selected" : ""}`}
          title="Tổng hợp"
        >
          Tổng hợp
        </button>
        {topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopicId(topic.id)}
            className={`topic-btn max-w-[120px] truncate overflow-hidden whitespace-nowrap ${selectedTopicId === topic.id ? "selected" : ""}`}
            title={topic.name}
          >
            {topic.name}
          </button>
        ))}
      </div>
      
      {/* Flashcard */}
      <div className="flex justify-center mb-6 w-full">
        <div className="w-full flex justify-center">
          {loading ? (
            <Loading text="Đang tải dữ liệu..." />
          ) : error ? (
            <div className="text-red-500 text-lg">{error}</div>
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
            <p className="text-center text-gray-500">Không có từ vựng cho chủ đề này</p>
          )}
        </div>
      </div>
      
      {/* Navigation buttons + Random */}
      <div className="flex justify-center gap-2 w-full max-w-xs mx-auto mb-2">
        <button onClick={handlePrevious} className="btn flex-1" disabled={vocabulary.length === 0 || loading}>
          Previous
        </button>
        <span className="card-index flex items-center justify-center min-w-[60px]">
          {vocabulary.length > 0 ? currentIndex + 1 : 0} / {vocabulary.length}
        </span>
        <button onClick={handleNext} className="btn flex-1" disabled={vocabulary.length === 0 || loading}>
          Next
        </button>
      </div>
      <button onClick={handleRandom} className="btn btn-primary w-full max-w-xs" disabled={vocabulary.length === 0 || loading}>
        Random
      </button>
    </main>
  );
} 