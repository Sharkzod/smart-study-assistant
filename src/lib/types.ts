export interface KeyTopic {
  topic: string;
  frequency: number;
  relevance: number;
}

export interface ExamFocus {
  area: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface AnalysisResult {
  keyTopics: KeyTopic[];
  summary: string;
  examFocus: ExamFocus[];
  flashcards: Flashcard[];
  wordCount: number;
  sentenceCount: number;
}
