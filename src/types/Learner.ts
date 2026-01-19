import type { GenderType } from "@/types/enum/GenderType";
import type { UserRole } from "@/types/enum/UserRole";

export interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  organisationId?: string;
}

export interface LearnerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  profilePicture?: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  isActive: boolean;
  organisationId?: string;
}

export interface LearnerRanking {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string;
  gender: string;
  score: number;
  formationScore?: number;
  ranking: number;
  isActive?: boolean;
}

export interface RawLearner {
  nom: string;
  prenom: string;
  date_de_naissance: string;
  email: string | { text: string };
  telephone: string;
  sexe: string;
};

export interface LearnerProfile {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  role: UserRole;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profilePicture: string;
  totalScore: number;
  globalRanking: number;
  gender: GenderType;
}

export interface LearnerCourse {
  title: string;
  learnerScore: number;
  learnerRank: number;
  currentChapter: string;
  currentLesson: string;
  completionPercentage: number;
}
