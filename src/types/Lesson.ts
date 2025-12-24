export interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string; // URL de la miniature dans S3
  fileSize?: number; // Taille du fichier en bytes
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
  thumbnailUrl?: string; // URL de la miniature dans S3
  fileSize?: number; // Taille du fichier en bytes
}
