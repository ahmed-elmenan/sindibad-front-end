export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  OPEN_QUESTION = "OPEN_QUESTION"
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  score: number;
  createdAt: Date;
} 