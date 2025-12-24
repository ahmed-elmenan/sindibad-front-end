# API_FLOW.md

# API Flow Documentation

## Overview
This document describes the data flow from API interactions through services to components in the SindiBad e-learning platform.

## API Configuration

### Base Setup
Location: [`src/lib/axios.ts`](src/lib/axios.ts)

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## Service Layer Architecture

### Authentication Services
Location: [`src/services/auth.service.ts`](src/services/auth.service.ts)

#### Login Flow
```typescript
// Component → Service → API → Response
User clicks login button
    ↓
SignInForm component calls signIn()
    ↓
auth.service.signIn(credentials)
    ↓
POST /api/auth/login
    ↓
Response: { token, user, role }
    ↓
Store token in localStorage
    ↓
Navigate to role-specific dashboard
```

**Service Function**:
```typescript
export const signIn = async (credentials: SignInFormData) => {
  const response = await api.post('/auth/login', credentials)
  const { token, user } = response.data
  localStorage.setItem('token', token)
  return { user, token }
}
```

**Component Usage**:
```typescript
const handleLogin = async (data: SignInFormData) => {
  try {
    const { user } = await signIn(data)
    navigate(`/${user.role.toLowerCase()}`)
  } catch (error) {
    toast.error('Login failed')
  }
}
```

#### Registration Flow (Organization)
```typescript
User fills multi-step form
    ↓
SignUpOrganisation component
    ↓
Step 1: Organization info
Step 2: Coordinator info
Step 3: Upload learners Excel
Step 4: Select courses
Step 5: Summary & submit
    ↓
organisation.service.registerOrganisation(data)
    ↓
POST /api/organisations/register
    ↓
Response: { success, message }
    ↓
Show success message → Navigate to login
```

### Course Services
Location: [`src/services/course.service.ts`](src/services/course.service.ts)

#### Get All Courses
```typescript
// Flow
CoursesPage component mounts
    ↓
useQuery hook calls getCourses()
    ↓
GET /api/courses?page=1&limit=10&search=...
    ↓
Response: { courses: Course[], total, pages }
    ↓
React Query caches data
    ↓
Component renders course list
```

**Service Function**:
```typescript
export const getCourses = async (params?: {
  page?: number
  limit?: number
  search?: string
  category?: string
}) => {
  const response = await api.get('/courses', { params })
  return response.data
}
```

**Component with React Query**:
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['courses', filters],
  queryFn: () => getCourses(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

#### Get Course Details
```typescript
User clicks on course
    ↓
Navigate to /courses/:id
    ↓
CourseDetailsPage component
    ↓
useQuery calls getCourseById(id)
    ↓
GET /api/courses/:id
    ↓
Response: {
  course: Course,
  chapters: Chapter[],
  enrollmentStatus: boolean
}
    ↓
Display course details, chapters, enrollment button
```

### Chapter Services
Location: [`src/services/chapter.service.ts`](src/services/chapter.service.ts)

#### Upload Chapters with Videos
```typescript
Admin drags videos into ChapterManager
    ↓
Files validated (naming: ch1-v1.mp4, ch2-v1.mp4)
    ↓
createCourseWithChapters(courseId, files, metadata)
    ↓
FormData created with files + metadata
    ↓
POST /api/courses/:courseId/chapters/batch
    ↓
Backend processes:
  - Upload videos to storage
  - Extract duration
  - Create chapters & lessons
    ↓
Response: { chapters: Chapter[] }
    ↓
Update UI with new chapters
```

**Service Function**:
```typescript
export const createCourseWithChapters = async (
  courseId: string,
  files: File[],
  metadata: ChapterMetadata
) => {
  const formData = new FormData()
  
  files.forEach(file => formData.append('files', file))
  formData.append('metadata', JSON.stringify(metadata))
  
  const response = await api.post(
    `/courses/${courseId}/chapters/batch`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  
  return response.data
}
```

### Quiz Services
Location: [`src/services/quiz.service.ts`](src/services/quiz.service.ts)

#### Quiz Taking Flow
```typescript
Learner completes lesson
    ↓
Clicks "Start Quiz" button
    ↓
Navigate to /quiz/:lessonId?quizType=SIMPLE_QUIZ
    ↓
QuizPage component
    ↓
getQuizByLessonId(lessonId)
    ↓
GET /api/quizzes/lesson/:lessonId
    ↓
Response: {
  quiz: Quiz,
  questions: Question[],
  sessionId: string
}
    ↓
Display quiz interface with timer
    ↓
User submits answers
    ↓
submitQuiz({ quizId, answers, sessionId })
    ↓
POST /api/quizzes/:quizId/submit
    ↓
Response: {
  score: number,
  passed: boolean,
  correctAnswers: number,
  detailedResults: QuestionResult[]
}
    ↓
Display results page
```

**Service Functions**:
```typescript
export const getQuizByLessonId = async (lessonId: string) => {
  const response = await api.get(`/quizzes/lesson/${lessonId}`)
  return response.data
}

export const submitQuiz = async (data: QuizSubmissionRequest) => {
  const response = await api.post(`/quizzes/${data.quizId}/submit`, {
    answers: data.answers,
    sessionId: data.sessionId,
    timeSpent: data.timeSpent
  })
  return response.data
}
```

### Progress Tracking
Location: [`src/services/progress.service.ts`](src/services/progress.service.ts)

#### Update Lesson Progress
```typescript
Video player tracks progress
    ↓
On video end or significant progress
    ↓
updateLessonProgress(lessonId, progress)
    ↓
PUT /api/progress/lesson/:lessonId
    ↓
Backend updates:
  - Lesson completion status
  - Chapter progress
  - Course overall progress
    ↓
Response: { progress: Progress }
    ↓
Update UI progress bars
    ↓
Unlock next lesson if completed
```

## React Query Integration

### Query Keys Structure
```typescript
// Courses
['courses'] - All courses
['courses', filters] - Filtered courses
['course', courseId] - Specific course

// Chapters
['chapters', courseId] - Course chapters
['chapter', chapterId] - Specific chapter

// Lessons
['lesson', lessonId] - Specific lesson
['lessons', chapterId] - Chapter lessons

// Progress
['progress', userId] - User progress
['progress', courseId, userId] - Course progress

// Quiz
['quiz', quizId] - Quiz details
['quizResult', resultId] - Quiz result
```

### Cache Management
```typescript
// Invalidate queries after mutations
const queryClient = useQueryClient()

// After enrolling in course
await enrollInCourse(courseId)
queryClient.invalidateQueries(['course', courseId])
queryClient.invalidateQueries(['progress'])

// After completing quiz
await submitQuiz(data)
queryClient.invalidateQueries(['progress', courseId])
queryClient.invalidateQueries(['lesson', lessonId])
```

## Custom Hooks for API Integration

### useChapters Hook
Location: [`src/hooks/useChapters.ts`](src/hooks/useChapters.ts)

```typescript
export function useChapters({ courseId }) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const fetchChapters = async () => {
      setIsLoading(true)
      try {
        const data = await getChaptersByCourseId(courseId)
        setChapters(data.chapters)
      } catch (error) {
        toast.error('Failed to load chapters')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchChapters()
  }, [courseId])
  
  return { chapters, isLoading }
}
```

### useCourseQueries Hook
Location: [`src/hooks/useCourseQueries.ts`](src/hooks/useCourseQueries.ts)

```typescript
export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  })
}

export const useCourseChapters = (courseId: string) => {
  return useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => getChaptersByCourseId(courseId),
    enabled: !!courseId,
  })
}
```

## Error Handling Patterns

### Service Layer Error Handling
```typescript
export const getCourseById = async (id: string) => {
  try {
    const response = await api.get(`/courses/${id}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course')
    }
    throw error
  }
}
```

### Component Error Handling
```typescript
const { data, error, isError } = useQuery({
  queryKey: ['course', courseId],
  queryFn: () => getCourseById(courseId),
  retry: 3,
  onError: (error) => {
    toast.error(error.message)
  }
})

if (isError) {
  return <ErrorDisplay error={error} />
}
```

## File Upload Flow

### Video Upload
```typescript
User drops videos
    ↓
Validate file types (.mp4, .webm)
    ↓
Create FormData with files
    ↓
Show upload progress
    ↓
POST /api/chapters/upload (multipart/form-data)
    ↓
Backend:
  - Upload to cloud storage
  - Generate thumbnail
  - Extract video metadata
    ↓
Response: { videoUrl, thumbnail, duration }
    ↓
Update chapter with video info
```

### Excel Import (Learners)
```typescript
User uploads Excel file
    ↓
Validate file format (.xlsx, .xls)
    ↓
Read file with exceljs
    ↓
Validate data structure
    ↓
Display preview table
    ↓
User confirms
    ↓
POST /api/organisations/learners/import
    ↓
Backend:
  - Validate emails
  - Create learner accounts
  - Send activation emails
    ↓
Response: { created, failed, errors }
    ↓
Display import results
```

## Real-time Updates

### Progress Synchronization
```typescript
// Optimistic updates
const mutation = useMutation({
  mutationFn: updateProgress,
  onMutate: async (newProgress) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['progress'])
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['progress'])
    
    // Optimistically update
    queryClient.setQueryData(['progress'], newProgress)
    
    return { previous }
  },
  onError: (err, newProgress, context) => {
    // Rollback on error
    queryClient.setQueryData(['progress'], context.previous)
  },
  onSettled: () => {
    // Refetch to sync
    queryClient.invalidateQueries(['progress'])
  }
})
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register/learner` - Learner registration
- `POST /api/auth/register/organisation` - Organization registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/enroll` - Enroll in course

### Chapters & Lessons
- `GET /api/courses/:courseId/chapters` - Get course chapters
- `POST /api/courses/:courseId/chapters/batch` - Upload chapters with videos
- `PUT /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter
- `GET /api/lessons/:id` - Get lesson details

### Quizzes
- `GET /api/quizzes/lesson/:lessonId` - Get lesson quiz
- `GET /api/quizzes/chapter/:chapterId` - Get chapter quiz
- `GET /api/quizzes/course/:courseId/final` - Get final exam
- `POST /api/quizzes/:quizId/submit` - Submit quiz answers
- `GET /api/quizzes/session/:sessionId/time` - Get remaining time

### Progress
- `GET /api/progress/user/:userId` - Get user progress
- `GET /api/progress/course/:courseId` - Get course progress
- `PUT /api/progress/lesson/:lessonId` - Update lesson progress
- `GET /api/progress/stats` - Get statistics

### Organizations
- `GET /api/organisations` - List organizations (Admin)
- `GET /api/organisations/:id/learners` - Get organization learners
- `POST /api/organisations/learners/import` - Import learners from Excel
- `GET /api/organisations/:id/dashboard` - Organization dashboard data

### Payments
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/receipt` - Submit payment receipt
- `GET /api/payments/status/:id` - Check payment status