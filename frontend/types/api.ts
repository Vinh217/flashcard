export interface Topic {
  id: string;
  name: string;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  topic_id: string;
  topic_name: string;
  synonym?: string;
  word_family?: string;
  example?: string;
  created_at: string;
} 