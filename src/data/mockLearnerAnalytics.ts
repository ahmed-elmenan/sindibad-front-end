/**
 * Mock Data pour Learner Profile Analytics - V1 MVP
 * Utilisé pour développement frontend sans backend
 * @version 1.0
 */

import type { LearnerAnalyticsDTO } from "@/types/learnerAnalytics";

export const MOCK_LEARNER_ANALYTICS: LearnerAnalyticsDTO = {
  profile: {
    id: "learner-001",
    userName: "mohamed.amine",
    firstName: "Mohamed",
    lastName: "Amine",
    email: "mohamed.amine@example.com",
    phoneNumber: "+212 6 12 34 56 78",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed",
    dateOfBirth: "1998-05-15",
    gender: "MALE",
    organizationName: "Tech Academy Maroc",
    isActive: true,
    role: "LEARNER",
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2026-01-19T16:30:00Z",
    lastActivityDate: "2026-01-19T16:30:00Z",
    globalRanking: 12,
    totalScore: 2450,
  },

  globalMetrics: {
    totalCoursesEnrolled: 5,
    totalCoursesCompleted: 2,
    totalCoursesInProgress: 3,
    totalLessonsCompleted: 67,
    totalLessons: 120,
    overallProgressPercentage: 55.8,
    totalTimeSpentMinutes: 2340, // 39 heures
    averageTimePerDay: 45,
    longestStreak: 21,
    currentStreak: 8,
    totalCertificatesEarned: 2,
    lastActivityDate: "2026-01-19T16:30:00Z",
    activeDays: 52,
  },

  coursesProgress: [
    {
      courseId: "course-001",
      courseTitle: "React Avancé - Hooks & Performance",
      courseThumbnail: "/public/course-react.jpg",
      courseDescription: "Maîtriser React avec les hooks avancés et optimisations",
      completionPercentage: 75,
      completedLessons: 18,
      totalLessons: 24,
      learnerScore: 850,
      averageScore: 720,
      learnerRank: 5,
      totalLearners: 45,
      enrolledDate: "2025-11-15T00:00:00Z",
      lastAccessDate: "2026-01-19T16:30:00Z",
      chapters: [
        {
          chapterId: "ch-001",
          chapterTitle: "Introduction aux Hooks",
          chapterOrder: 1,
          completionPercentage: 100,
          lessons: [
            {
              lessonId: "lesson-001",
              lessonTitle: "useState et useEffect",
              lessonType: "VIDEO",
              lessonOrder: 1,
              isCompleted: true,
              completedAt: "2025-11-16T14:00:00Z",
              timeSpentMinutes: 45,
            },
            {
              lessonId: "lesson-002",
              lessonTitle: "Quiz: Bases des Hooks",
              lessonType: "QUIZ",
              lessonOrder: 2,
              isCompleted: true,
              completedAt: "2025-11-16T15:00:00Z",
              timeSpentMinutes: 15,
              quizScore: 90,
              quizPassed: true,
            },
          ],
        },
        {
          chapterId: "ch-002",
          chapterTitle: "Hooks Avancés",
          chapterOrder: 2,
          completionPercentage: 66,
          lessons: [
            {
              lessonId: "lesson-003",
              lessonTitle: "useContext & useReducer",
              lessonType: "VIDEO",
              lessonOrder: 3,
              isCompleted: true,
              completedAt: "2025-11-20T10:00:00Z",
              timeSpentMinutes: 60,
            },
            {
              lessonId: "lesson-004",
              lessonTitle: "Custom Hooks",
              lessonType: "READING",
              lessonOrder: 4,
              isCompleted: true,
              completedAt: "2025-11-21T14:00:00Z",
              timeSpentMinutes: 30,
            },
            {
              lessonId: "lesson-005",
              lessonTitle: "Exercice Pratique",
              lessonType: "EXERCISE",
              lessonOrder: 5,
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      courseId: "course-002",
      courseTitle: "Spring Boot Microservices",
      courseThumbnail: "/public/course-spring.jpg",
      courseDescription: "Architectures microservices avec Spring Boot",
      completionPercentage: 45,
      completedLessons: 9,
      totalLessons: 20,
      learnerScore: 420,
      averageScore: 580,
      learnerRank: 28,
      totalLearners: 35,
      enrolledDate: "2025-12-01T00:00:00Z",
      lastAccessDate: "2026-01-10T09:00:00Z",
      chapters: [
        {
          chapterId: "ch-010",
          chapterTitle: "Introduction à Spring Boot",
          chapterOrder: 1,
          completionPercentage: 100,
          lessons: [
            {
              lessonId: "lesson-010",
              lessonTitle: "Configuration de base",
              lessonType: "VIDEO",
              lessonOrder: 1,
              isCompleted: true,
              completedAt: "2025-12-02T11:00:00Z",
              timeSpentMinutes: 40,
            },
          ],
        },
        {
          chapterId: "ch-011",
          chapterTitle: "REST APIs",
          chapterOrder: 2,
          completionPercentage: 50,
          lessons: [
            {
              lessonId: "lesson-011",
              lessonTitle: "Créer des endpoints REST",
              lessonType: "VIDEO",
              lessonOrder: 2,
              isCompleted: true,
              completedAt: "2025-12-05T14:00:00Z",
              timeSpentMinutes: 55,
            },
            {
              lessonId: "lesson-012",
              lessonTitle: "Quiz: REST Basics",
              lessonType: "QUIZ",
              lessonOrder: 3,
              isCompleted: true,
              completedAt: "2025-12-06T10:00:00Z",
              timeSpentMinutes: 20,
              quizScore: 65,
              quizPassed: true,
            },
            {
              lessonId: "lesson-013",
              lessonTitle: "Validation et Exception Handling",
              lessonType: "VIDEO",
              lessonOrder: 4,
              isCompleted: false,
            },
          ],
        },
      ],
    },
    {
      courseId: "course-003",
      courseTitle: "TypeScript pour React",
      courseThumbnail: "/public/course-typescript.jpg",
      courseDescription: "Typage avancé avec TypeScript dans React",
      completionPercentage: 100,
      completedLessons: 15,
      totalLessons: 15,
      learnerScore: 920,
      averageScore: 750,
      learnerRank: 2,
      totalLearners: 50,
      enrolledDate: "2025-10-01T00:00:00Z",
      lastAccessDate: "2025-11-05T18:00:00Z",
      completionDate: "2025-11-05T18:00:00Z",
      chapters: [
        {
          chapterId: "ch-020",
          chapterTitle: "TypeScript Fundamentals",
          chapterOrder: 1,
          completionPercentage: 100,
          lessons: [
            {
              lessonId: "lesson-020",
              lessonTitle: "Types de base",
              lessonType: "VIDEO",
              lessonOrder: 1,
              isCompleted: true,
              completedAt: "2025-10-02T10:00:00Z",
              timeSpentMinutes: 35,
            },
          ],
        },
      ],
    },
  ],

  certifications: {
    totalCertificates: 2,
    certificates: [
      {
        certificateId: "cert-001",
        courseId: "course-003",
        courseTitle: "TypeScript pour React",
        courseThumbnail: "/public/course-typescript.jpg",
        finalScore: 92,
        issuedDate: "2025-11-05T18:00:00Z",
        certificateUrl: "/api/certificates/cert-001/download",
        verificationCode: "TS-REACT-2025-001",
      },
      {
        certificateId: "cert-002",
        courseId: "course-004",
        courseTitle: "HTML & CSS Avancé",
        courseThumbnail: "/public/course-html-css.jpg",
        finalScore: 88,
        issuedDate: "2025-10-15T12:00:00Z",
        certificateUrl: "/api/certificates/cert-002/download",
        verificationCode: "HTML-CSS-2025-002",
      },
    ],
  },

  insights: [
    {
      id: "insight-001",
      type: "ABANDONMENT_RISK",
      severity: "WARNING",
      title: "Risque d'abandon détecté",
      description:
        "Le cours 'Spring Boot Microservices' (45% complété) n'a pas été consulté depuis 9 jours. Risque d'abandon élevé.",
      actionLabel: "Envoyer un rappel",
      actionLink: "mailto:mohamed.amine@example.com?subject=Reprise du cours Spring Boot",
      metadata: {
        courseId: "course-002",
        daysSinceLastAccess: 9,
        completionPercentage: 45,
      },
      createdAt: "2026-01-19T00:00:00Z",
    },
    {
      id: "insight-002",
      type: "TOP_PERFORMER",
      severity: "SUCCESS",
      title: "Top performer actuel !",
      description:
        "Mohamed est classé #12 global avec un streak actif de 8 jours consécutifs. Excellente régularité !",
      actionLabel: "Envoyer félicitations",
      actionLink: "mailto:mohamed.amine@example.com?subject=Félicitations pour votre performance",
      metadata: {
        globalRanking: 12,
        currentStreak: 8,
      },
      createdAt: "2026-01-19T00:00:00Z",
    },
    {
      id: "insight-003",
      type: "CONTENT_DIFFICULTY",
      severity: "INFO",
      title: "Difficulté sur Spring Boot",
      description:
        "Score actuel (420 pts) inférieur à la moyenne (580 pts) dans Spring Boot. Peut nécessiter support additionnel.",
      actionLabel: "Proposer tutorat",
      actionLink: "/courses/course-002/support",
      metadata: {
        courseId: "course-002",
        learnerScore: 420,
        averageScore: 580,
      },
      createdAt: "2026-01-19T00:00:00Z",
    },
  ],

  flags: {
    lowScore: false,
    inactive: false,
    recentCertificate: false,
    activeStreak: true,
    streakDays: 8,
  },
};

// Mock data pour un learner avec problèmes (pour tester les alertes)
export const MOCK_LEARNER_WITH_ISSUES: LearnerAnalyticsDTO = {
  profile: {
    id: "learner-002",
    userName: "sara.elamrani",
    firstName: "Sara",
    lastName: "El Amrani",
    email: "sara.elamrani@example.com",
    phoneNumber: "+212 6 98 76 54 32",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara",
    dateOfBirth: "1999-08-22",
    gender: "FEMALE",
    isActive: true,
    role: "LEARNER",
    createdAt: "2025-08-15T10:00:00Z",
    updatedAt: "2026-01-05T12:00:00Z",
    lastActivityDate: "2026-01-05T12:00:00Z",
    globalRanking: 87,
    totalScore: 980,
  },

  globalMetrics: {
    totalCoursesEnrolled: 3,
    totalCoursesCompleted: 0,
    totalCoursesInProgress: 3,
    totalLessonsCompleted: 12,
    totalLessons: 60,
    overallProgressPercentage: 20.0,
    totalTimeSpentMinutes: 450,
    averageTimePerDay: 18,
    longestStreak: 5,
    currentStreak: 0,
    totalCertificatesEarned: 0,
    lastActivityDate: "2026-01-05T12:00:00Z",
    activeDays: 25,
  },

  coursesProgress: [
    {
      courseId: "course-001",
      courseTitle: "React Avancé - Hooks & Performance",
      courseThumbnail: "/public/course-react.jpg",
      completionPercentage: 25,
      completedLessons: 6,
      totalLessons: 24,
      learnerScore: 320,
      averageScore: 720,
      learnerRank: 42,
      totalLearners: 45,
      enrolledDate: "2025-10-01T00:00:00Z",
      lastAccessDate: "2025-12-20T14:00:00Z",
      chapters: [],
    },
  ],

  certifications: {
    totalCertificates: 0,
    certificates: [],
  },

  insights: [
    {
      id: "insight-100",
      type: "ACTIVITY_SLOWDOWN",
      severity: "CRITICAL",
      title: "Inactivité prolongée détectée",
      description:
        "Aucune activité depuis 15 jours. Risque d'abandon très élevé.",
      actionLabel: "Contacter immédiatement",
      actionLink: "mailto:sara.elamrani@example.com?subject=Besoin d'aide ?",
      metadata: {
        daysSinceLastActivity: 15,
      },
      createdAt: "2026-01-19T00:00:00Z",
    },
    {
      id: "insight-101",
      type: "CONTENT_DIFFICULTY",
      severity: "CRITICAL",
      title: "Scores très faibles",
      description:
        "Score global (980 pts) très inférieur à la moyenne. Difficulté majeure identifiée.",
      actionLabel: "Proposer coaching",
      actionLink: "/learners/learner-002/support",
      metadata: {
        totalScore: 980,
      },
      createdAt: "2026-01-19T00:00:00Z",
    },
  ],

  flags: {
    lowScore: true,
    inactive: true,
    recentCertificate: false,
    activeStreak: false,
    daysSinceActivity: 15,
  },
};
