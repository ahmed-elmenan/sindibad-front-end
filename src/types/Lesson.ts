export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  order: number;
  isLocked: boolean;
  updatedAt: string; // ISO date string
  skills: string[];
  chapter: { id: string; title: string };
  referenceUrl?: string; // URL de référence optionnelle
  isCompleted?: boolean;
  hasActiveQuiz?: boolean;
  miniChapter: string;
}

export interface LessonSummary {
  id: string;
  title: string;
  duration: number; // en secondes
  order: number;
  isLocked: boolean;
  skills: string[];
  isCompleted?: boolean;
  hasActiveQuiz?: boolean;
  miniChapter: string;
  videoUrl?: string;
}
