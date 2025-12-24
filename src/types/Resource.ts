import type { LessonSummary } from "@/types";
import type { QuizSummary } from "@/types/QuizSummary";


export interface Resource {
  type: "LESSON" | "FINAL_QUIZ" | "PHASE_QUIZ";
  lesson?: LessonSummary;
  quiz?: QuizSummary;
}