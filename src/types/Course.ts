export interface Course {
  id: string
  title: string
  description: string
  price?: number
  duration: number
  level: string
  category: string
  createdAt?: Date
  updatedAt?: Date
  isActive?: boolean
  referenceUrl?: string
  avgRating: number
  imgUrl: string
  features?: string[]
  participants?: number
}

export interface CourseRanking {
  id: string;
  name: string;
}

export interface CourseSubscription {
  loggedIn: boolean
  role: string
  learnersCount: number
  subscription: Subscription
}

export interface EnrollmentData {
  courseId: string
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  subscriptionId?: string;
}

import type { Subscription } from "./Subscription";