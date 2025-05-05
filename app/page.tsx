'use client';

import { useState, useEffect } from 'react';
import Flashcard from './components/Flashcard';

const topicFiles = [
  { name: "Tổng hợp", file: "all" },
  { name: "Job", file: "job.json" },
  { name: "Advertising Marketing Promotion", file: "advertising_marketing_promotion.json" },
  { name: "Manufacturing", file: "manufacturing.json" },
  { name: "Shipping", file: "shipping.json" },
  { name: "Technology Internet", file: "technology_internet.json" },
  { name: "Contract Law", file: "contract_law.json" },
  { name: "Shopping", file: "shopping.json" },
  { name: "Travel And Tourism", file: "travel_and_tourisim.json" },
  { name: "Real Estate Banking", file: "real_estate_banking.json" },
  { name: "Cuisine Leisure", file: "cuisine_leisure.json" },
  { name: "Custom", file: "custom" },
];

interface VocabularyItem {
  word: string;
  pronunciation?: string;
  meaning: string;
  topic: string;
  synonym?: string;
  word_family?: string;
  example?: string[];
}

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState(topicFiles[0].file);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load dữ liệu topic
  useEffect(() => {
    setLoading(true);
    setError("");
    setCurrentIndex(0);
    if (selectedTopic === "all") {
      // Gộp tất cả các topic (trừ all và custom)
      const topicFetches = topicFiles
        .filter(t => t.file !== "all" && t.file !== "custom")
        .map(t => fetch(`/topic/${t.file}`).then(res => res.json()));
      Promise.all(topicFetches)
        .then(results => {
          const all = ([] as VocabularyItem[]).concat(...results);
          setVocabulary(all);
          setLoading(false);
        })
        .catch(() => {
          setError("Lỗi tải dữ liệu tổng hợp");
          setLoading(false);
        });
    } else {
      fetch(`/topic/${selectedTopic}`)
        .then((res) => {
          if (!res.ok) throw new Error("Không thể tải dữ liệu");
          return res.json();
        })
        .then((data) => {
          setVocabulary(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Lỗi tải dữ liệu từ vựng");
          setLoading(false);
        });
    }
  }, [selectedTopic]);

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
        {topicFiles.filter(t => t.file !== 'custom').map((topic) => (
          <button
            key={topic.file}
            onClick={() => setSelectedTopic(topic.file)}
            className={`topic-btn max-w-[120px] truncate overflow-hidden whitespace-nowrap ${selectedTopic === topic.file ? "selected" : ""}`}
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
            <div className="text-gray-500 text-lg">Đang tải dữ liệu...</div>
          ) : error ? (
            <div className="text-red-500 text-lg">{error}</div>
          ) : vocabulary.length > 0 ? (
            <Flashcard
              word={vocabulary[currentIndex].word}
              meaning={vocabulary[currentIndex].meaning}
              topic={vocabulary[currentIndex].topic}
              pronunciation={vocabulary[currentIndex].pronunciation}
              synonym={vocabulary[currentIndex].synonym}
              word_family={vocabulary[currentIndex].word_family}
              example={vocabulary[currentIndex].example}
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
