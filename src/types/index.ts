export * from "./Organization";
export * from "./Pack";
export * from "./Learner";
export * from "./Subscription";
export * from "./Invoice";
export * from "./Certificate";
export * from "./Review";
export * from "./Course";
export * from "./Chapter";
export * from "./Lesson";
export * from "./Comment";
export * from "./LessonCommentPayload";
export * from "./Sponsor";
export * from "./QuizSession";
export * from "./Quiz";
export * from "./FinalQuiz";
export * from "./Answer";
export * from "./Question";
export * from "./Option";
export * from "./Skill";
export * from "./Admin";
export * from "./SuperAdmin";

// Subscription Request Types
export type SubscriptionRequestStatus = 'PENDING' | 'REFUSED' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';

export interface SubscriptionRequest {
  id: string;
  organisationName: string;
  responsibleFullName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  courseId: string;
  courseName: string;
  packId: string;
  packName: string;
  minLearners: number;
  maxLearners: number;
  unitPrice: number;
  discountPercentage: number;
  amount: number;
  status: SubscriptionRequestStatus;
  createdAt: string;
  receiptUrl: string | null;
  receiptFileName: string | null;
  refusedReason: string | null;
  processedBy: string | null;
  processedAt: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface SubscriptionFilters {
  searchTerm?: string;
  status?: SubscriptionRequestStatus;
  startDate?: number;
  endDate?: number;
  page?: number;
  size?: number;
}

export interface SubscriptionRequestsResponse {
  content: SubscriptionRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ProcessSubscriptionDTO {
  processedBy: string;
}

export interface RefuseRequestDTO {
  refusedReason: string;
  processedBy: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  expiresIn: string;
}

export interface SubscriptionStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  refusedRequests: number;
}
