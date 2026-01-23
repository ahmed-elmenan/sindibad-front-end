export interface QuizSkillRequest {
  skillName: string;
  numberOfQuestions: number;
}

export interface QuizManagementRequest {
  title: string;
  description?: string;
  duration: number;
  timerPoints: number;
  skills: QuizSkillRequest[];
}

export interface QuizSkillDetail {
  skillId: string;
  skillName: string;
  numberOfQuestions: number;
}

export interface QuizDetailResponse {
  id: string;
  title: string;
  description?: string;
  duration: number;
  timerPoints: number;
  quizType: "SIMPLE_QUIZ" | "PHASE_QUIZ" | "FINAL_QUIZ";
  numberOfQuestions: number;
  createdAt: string;
  updatedAt: string;
  skills: QuizSkillDetail[];
  
  // Contextual information
  lessonId?: string;
  lessonTitle?: string;
  chapterId?: string;
  chapterTitle?: string;
  courseId?: string;
  courseTitle?: string;
}
