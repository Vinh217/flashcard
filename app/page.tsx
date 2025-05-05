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

  // Email state
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");

  // Form state cho custom
  const [newWord, setNewWord] = useState("");
  const [newPronunciation, setNewPronunciation] = useState("");
  const [newMeaning, setNewMeaning] = useState("");

  // Lấy email từ localStorage khi load app
  useEffect(() => {
    const saved = localStorage.getItem("user_email");
    if (saved) setEmail(saved);
  }, []);

  // Load dữ liệu topic
  useEffect(() => {
    if (!email && selectedTopic === "custom") return;
    setLoading(true);
    setError("");
    setCurrentIndex(0);
    if (selectedTopic === "all") {
      // Gộp tất cả topic + custom nếu có email
      const topicFetches = topicFiles
        .filter(t => t.file !== "all" && t.file !== "custom")
        .map(t => fetch(`/topic/${t.file}`).then(res => res.json()));
      const customFetch = email
        ? fetch(`/api/custom-vocab?email=${encodeURIComponent(email)}`).then(res => res.json())
        : Promise.resolve([]);
      Promise.all([...topicFetches, customFetch])
        .then(results => {
          // Gộp tất cả các mảng lại
          const all = ([] as VocabularyItem[]).concat(...results);
          setVocabulary(all);
          setLoading(false);
        })
        .catch(() => {
          setError("Lỗi tải dữ liệu tổng hợp");
          setLoading(false);
        });
    } else if (selectedTopic === "custom") {
      // Lấy custom từ API
      fetch(`/api/custom-vocab?email=${encodeURIComponent(email!)}`)
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
  }, [selectedTopic, email]);

  // Thêm từ mới vào custom (gửi lên API)
  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord || !newMeaning || !email) return;
    const newItem: VocabularyItem = {
      word: newWord,
      pronunciation: newPronunciation,
      meaning: newMeaning,
      topic: "Custom",
    };
    setLoading(true);
    await fetch(`/api/custom-vocab?email=${encodeURIComponent(email)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    setNewWord("");
    setNewPronunciation("");
    setNewMeaning("");
    // Reload lại custom vocab
    fetch(`/api/custom-vocab?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        setVocabulary(data);
        setCurrentIndex(data.length - 1);
        setLoading(false);
      });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
  };
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
  };
  const handleRandom = () => {
    if (vocabulary.length > 1) {
      // Fisher-Yates shuffle
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

  // Xử lý login/logout email
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    localStorage.setItem("user_email", emailInput);
    setEmail(emailInput);
    setEmailInput("");
  };
  const handleLogout = () => {
    localStorage.removeItem("user_email");
    setEmail(null);
    setVocabulary([]);
    setSelectedTopic(topicFiles[0].file);
  };

  if (!email) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">Nhập email để sử dụng Flashcard</h2>
          <input
            className="border rounded px-3 py-2"
            placeholder="Email của bạn"
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            required
            type="email"
          />
          <button type="submit" className="btn btn-primary">Tiếp tục</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-2">
          <span className="mr-4 text-gray-600">{email}</span>
          <button onClick={handleLogout} className="btn">Đăng xuất</button>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">
          TOEIC Vocabulary Flashcards
        </h1>
        {/* Tab topic */}
        <div className="topic-scroll mb-8">
          {topicFiles.map((topic) => (
            <button
              key={topic.file}
              onClick={() => setSelectedTopic(topic.file)}
              className={`topic-btn max-w-[140px] truncate overflow-hidden whitespace-nowrap ${selectedTopic === topic.file ? "selected" : ""}`}
              title={topic.name}
            >
              {topic.name}
            </button>
          ))}
        </div>
        {/* Form thêm từ mới cho custom */}
        {selectedTopic === "custom" && (
          <form onSubmit={handleAddCustom} className="mb-8 flex flex-col md:flex-row gap-2 items-center justify-center">
            <input
              className="border rounded px-3 py-2 w-40"
              placeholder="Từ mới"
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2 w-40"
              placeholder="Phiên âm"
              value={newPronunciation}
              onChange={e => setNewPronunciation(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2 w-60"
              placeholder="Nghĩa tiếng Việt"
              value={newMeaning}
              onChange={e => setNewMeaning(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">Thêm từ</button>
          </form>
        )}
        {/* Flashcard */}
        <div className="flex justify-center mb-8 min-h-[260px]">
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
        {/* Navigation buttons + Random */}
        <div className="flex justify-center gap-4">
          <button onClick={handlePrevious} className="btn" disabled={vocabulary.length === 0 || loading}>
            Previous
          </button>
          <span className="card-index">
            {vocabulary.length > 0 ? currentIndex + 1 : 0} / {vocabulary.length}
          </span>
          <button onClick={handleNext} className="btn" disabled={vocabulary.length === 0 || loading}>
            Next
          </button>
          <button onClick={handleRandom} className="btn btn-primary" disabled={vocabulary.length === 0 || loading}>
            Random
          </button>
        </div>
      </div>
    </main>
  );
}
