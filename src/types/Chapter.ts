export interface Chapter {
  
  id: string;
  title: string;
  order: number;
  description: string;
  lessons?: LessonSummary[];
  quiz?: QuizSummary | null;
}



export interface CourseSummary {
  chapters: Chapter[];
  finalExam?: QuizSummary | null;
  learnerProgressStatus: ProgressStatus;
}

import type { ProgressStatus } from './enum/ProgressStatus';
import type { LessonSummary } from './Lesson';
import type { QuizSummary } from './QuizSummary';
