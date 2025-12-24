export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

// Types pour l'API VideoQuiz basés sur le backend Spring Boot
export interface VideoQuizRequest {
  learnerId: string;
  numberOfQuestions?: number;
}
export interface SkillResult {
  skillName: string;
  correctAnswers: number;
  totalQuestions: number;
  skillScore: number;
}

export interface RandomQuestionDTO {
  id: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'OPEN_QUESTION';
  options?: OptionDTO[];
  skillName?: string;
  timeLimit?: number;
  timeLeft?: number;
}

export interface OptionDTO {
  id: string;
  optionText: string;
  isCorrect?: boolean;
}

export interface VideoQuizResponse {
  title: any;
  quizSessionId: string;
  lessonId: string;
  lessonTitle: string;
  skillsCovered: string[];
  timeLimit: number;
  timeLeft:number;
  questions: RandomQuestionDTO[];
}

export interface QuizSubmissionRequest {
  quizSessionId: string;
  answers: StudentAnswer[];
  submissionTime?: string;
}

export interface StudentAnswer {
  questionId: string;
  questionType: 'MULTIPLE_CHOICE' | 'OPEN_QUESTION';
  selectedOptionId?: string;
  answerText?: string;
  timeSpent?: number;
}

export interface QuizResultResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  canAccessNextVideo: boolean;
  feedback: string;
  detailedResults?: QuestionResult[];
   questionDetails?: QuestionResultDetail[];
   // Nouveaux champs
  accuracyScore?: number;
  speedScore?: number; 
  timeUsedSeconds?: number;
  speedLevel?: string;
  messages?: string[];     
  skillResults?: SkillResult[]; // Résultats détaillés par compétence  
  finalQuizScore?: number;
  finalQuizPassed?: boolean;
  simpleQuizScore?: number; 
  chapterQuizScore?: number;
    
}
export interface QuestionResultDetail {
  questionId: string;
  questionText: string;
  questionType: string;
  points: number;
  skillName?: string;
  correct: boolean;
  options?: OptionDetail[]; // Pour les QCM
  studentAnswer?: string;  // Pour les questions ouvertes
  correctAnswer?: string;  // Pour les questions ouvertes
}

export interface OptionDetail {
  optionId: string;
  optionText: string;
  correct: boolean;
  wasSelected: boolean;
}
export interface QuestionResult {
  questionId: string;
  questionText: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer?: string;
  explanation?: string;
}