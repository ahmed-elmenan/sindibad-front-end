/**
 * Types pour Learner Profile Analytics
 */

export interface LearnerProfileHeader {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  organizationName?: string;
  
  isActive: boolean;
  role: "LEARNER";
  
  createdAt: string;
  updatedAt: string;
  lastActivityDate?: string;
  
  globalRanking: number;
  totalScore: number;
}

export interface LearnerGlobalMetrics {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalCoursesInProgress: number;
  
  totalLessonsCompleted: number;
  totalLessons: number;
  
  overallProgressPercentage: number;
  
  totalTimeSpentMinutes: number;
  averageTimePerDay: number;
  longestStreak: number;
  currentStreak: number;
  
  totalCertificatesEarned: number;
  
  lastActivityDate: string;
  activeDays: number;
}

// ============================================
// 3. AVANCEMENT PAR COURS
// ============================================

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  courseDescription?: string;
  
  completionPercentage: number;
  completedLessons: number;
  totalLessons: number;
  
  learnerScore: number;
  averageScore: number;
  
  learnerRank: number;
  totalLearners: number;
  
  enrolledDate: string;
  lastAccessDate: string;
  completionDate?: string;
  
  chapters: ChapterProgress[];
}

export interface ChapterProgress {
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  completionPercentage: number;
  lessons: LessonProgress[];
}

export interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  lessonType: "VIDEO" | "READING" | "QUIZ" | "EXERCISE";
  lessonOrder: number;
  isCompleted: boolean;
  completedAt?: string;
  timeSpentMinutes?: number;
  
  quizScore?: number;
  quizPassed?: boolean;
}

// ============================================
// 4. CERTIFICATS
// ============================================

export interface Certifications {
  totalCertificates: number;
  certificates: CertificateDetail[];
}

export interface CertificateDetail {
  certificateId: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  finalScore: number;
  issuedDate: string;
  certificateUrl: string;
  verificationCode?: string;
}

// ============================================
// 5. INSIGHTS AUTOMATIQUES (V1)
// ============================================

export type InsightType = 
  | "ACTIVITY_SLOWDOWN"
  | "SCORE_VS_REGULARITY"
  | "ABANDONMENT_RISK"
  | "TOP_PERFORMER"
  | "CONTENT_DIFFICULTY";

export type InsightSeverity = "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  actionLabel: string;
  actionLink?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ============================================
// 6. FLAGS/ALERTES POUR RANKING TABLE
// ============================================

export interface LearnerFlags {
  lowScore: boolean;
  inactive: boolean;
  recentCertificate: boolean;
  activeStreak: boolean;
  streakDays?: number;
  daysSinceActivity?: number;
}

// ============================================
// 7. DTO PRINCIPAL
// ============================================

export interface LearnerAnalyticsDTO {
  profile: LearnerProfileHeader;
  globalMetrics: LearnerGlobalMetrics;
  coursesProgress: CourseProgress[];
  certifications: Certifications;
  insights: Insight[];
  flags: LearnerFlags;
}

// ============================================
// TYPES UTILITAIRES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * DTO pour mettre à jour la progression d'un learner
 * Utilisé pour le tracking depuis le frontend
 */
export interface UpdateProgressDTO {
  learnerId: string;
  courseId: string;
  additionalTimeMinutes?: number;
  currentChapterOrder?: number;
  currentLessonOrder?: number;
  completionPercentage?: number;
}
