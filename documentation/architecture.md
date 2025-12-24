# ARCHITECTURE.md

# Project Architecture Documentation

## Overview
SindiBad is a modern e-learning platform built with React, TypeScript, and Vite. The application supports multiple user roles (Admin, Organization, Learner) with a focus on course management, quiz systems, and learner progress tracking.

## Technology Stack

### Frontend
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.1.11
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **State Management**: Zustand, React Query (@tanstack/react-query)
- **Routing**: React Router DOM 7.6.3
- **Animations**: Framer Motion, Lottie React
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Internationalization**: i18next, react-i18next (supports French & Arabic with RTL)

### Key Libraries
- **Data Tables**: @tanstack/react-table
- **Drag & Drop**: react-dnd, react-dropzone, @dnd-kit
- **File Handling**: exceljs, file-saver, xlsx
- **Video Player**: react-player
- **Charts**: recharts
- **Icons**: lucide-react, @tabler/icons-react
- **PDF Generation**: jsPDF (for certificates)

## Project Structure

```
src/
├── assets/           # Static assets (lottie animations, images)
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (shadcn/ui)
│   ├── form/        # Form components
│   ├── admin/       # Admin-specific components
│   ├── course/      # Course-related components
│   ├── learners/    # Learner-specific components
│   ├── Lesson/      # Lesson components
│   └── quiz/        # Quiz components
├── config/          # Configuration files (payment, etc.)
├── constants/       # Constants and static data
├── contexts/        # React contexts (AuthContext)
├── data/            # Static JSON data
├── hooks/           # Custom React hooks
├── layouts/         # Layout components (DashboardLayout, HomeLayout)
├── lib/             # Utility libraries (axios config, utils)
├── locales/         # i18n translation files (fr.json, ar.json)
├── pages/           # Page components organized by feature
│   ├── admin/       # Admin pages
│   ├── auth/        # Authentication pages
│   ├── course/      # Course pages
│   ├── lessons/     # Lesson pages
│   ├── learners/    # Learner pages
│   ├── motivation/  # Motivation/gamification pages
│   └── organisation/# Organization pages
├── routes/          # Route definitions
├── schemas/         # Zod validation schemas
├── services/        # API service layer
├── types/           # TypeScript type definitions
├── App.tsx          # Root application component
├── i18n.ts          # i18next configuration
└── main.tsx         # Application entry point
```

## Architecture Patterns

### 1. **Component Architecture**
- **Atomic Design**: Components organized from basic UI elements to complex pages
- **Composition Pattern**: Reusable components composed together
- **Container/Presenter Pattern**: Separation of logic and presentation

### 2. **State Management**
- **Local State**: React useState/useReducer for component-level state
- **Server State**: React Query for API data caching and synchronization
- **Global State**: Zustand for application-wide state (minimal usage)
- **Context API**: AuthContext for authentication state

### 3. **Data Flow**
```
User Interaction → Component → Custom Hook → Service Layer → API
                                    ↓
                              React Query Cache
                                    ↓
                            Component Re-render
```

### 4. **Routing Structure**
```
/                          # Home page
/signup                    # Account type selection
/signup?account=learner    # Learner registration
/signup?account=organisation # Organization registration
/login                     # Login
/courses                   # Course catalog
/courses/:id               # Course details
/lessons/:courseId/:lessonId # Lesson viewer
/quiz/:quizId              # Quiz interface
/admin/*                   # Admin dashboard routes
/organisation/*            # Organization dashboard routes
/learner/*                 # Learner dashboard routes
```

## Core Features

### 1. **Multi-Role System**
- **Admin**: Full system management, course creation, user management
- **Organization**: Manage learners, track progress, purchase courses
- **Learner**: Take courses, complete quizzes, track progress

### 2. **Course Management**
- Hierarchical structure: Course → Chapters → Lessons (Videos)
- Video-based learning with progress tracking
- Chapter and final exam quizzes
- Certificate generation on completion

### 3. **Quiz System**
Three types of quizzes:
- **SIMPLE_QUIZ**: After each lesson/video
- **PHASE_QUIZ**: After completing a chapter
- **FINAL_QUIZ**: Course-wide final exam

### 4. **Internationalization**
- Support for French (LTR) and Arabic (RTL)
- Dynamic direction switching
- Comprehensive translation coverage

### 5. **Payment System**
Multiple payment methods:
- Bank Transfer
- WafaCash
- CashPlus
Receipt upload and verification workflow

## Component Architecture

### Key Components

#### Admin Components
- [`ChapterManager`](src/components/admin/ChapterManager.tsx): Drag-and-drop chapter/video management
- Video upload with automatic chapter detection
- Chapter merging and reordering

#### Course Components
- Course catalog with filtering
- Course detail pages with enrollment
- Pack selection for organizations

#### Lesson Components
- [`VideoPlayer`](src/components/Lesson/VideoPlayer.tsx): Custom video player with progress tracking
- [`TestSection`](src/components/Lesson/TestSection.tsx): Quiz trigger after lessons
- [`Resources`](src/components/Lesson/Resources.tsx): Additional learning materials

#### Quiz Components
- [`QuizPage`](src/pages/lessons/quiz/QuizPage.tsx): Interactive quiz interface
- Timer management
- Tab switching detection
- Result display with detailed feedback

## Data Models

### User Types
```typescript
interface User {
  id: string
  email: string
  role: 'ADMIN' | 'LEARNER' | 'ORGANISATION'
  firstName: string
  lastName: string
}
```

### Course Structure
```typescript
interface Course {
  id: string
  title: string
  description: string
  chapters: Chapter[]
}

interface Chapter {
  id: string
  number: number
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  videoUrl: string
  duration: number
  order: number
}
```

### Quiz Structure
```typescript
interface Quiz {
  id: string
  type: 'SIMPLE_QUIZ' | 'PHASE_QUIZ' | 'FINAL_QUIZ'
  title: string
  questions: Question[]
  timeLimit: number
}
```

## Security Considerations
- JWT-based authentication
- Protected routes with role-based access control
- Secure API endpoints with token validation
- Tab switching detection during quizzes
- File upload validation and sanitization

## Performance Optimizations
- Code splitting with React.lazy
- Image optimization
- React Query caching
- Skeleton loaders for better UX
- Debounced search and filters
- Virtual scrolling for long lists

## Deployment Architecture
- **Containerization**: Docker with multi-stage builds
- **Stage 1**: Node.js build environment
- **Stage 2**: Nginx for serving static files
- **Port**: 3000 (exposed via nginx.conf)