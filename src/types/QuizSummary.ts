export interface QuizSummary {
  id: string;
  title: string;
  chapterId: string;
  description: string;
  duration: number;
  isLocked: boolean;
  quizType: "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ";
  isActive?: boolean;
  isCompleted?: boolean;
}