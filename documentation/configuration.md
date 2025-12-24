# CONFIGURATION.md

# Configuration Documentation

## Environment Variables

### Location
Create a `.env` file in the project root directory.

### Required Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_TIMEOUT=30000

# Payment Configuration
VITE_BANK_NAME="Bank Name"
VITE_BANK_IBAN="IBAN NUMBER"
VITE_BANK_RIB="RIB NUMBER"
VITE_BANK_ACCOUNT_HOLDER="Account Holder Name"

VITE_WAFACASH_BENEFICIARY="WafaCash Beneficiary Name"
VITE_WAFACASH_PHONE="+212XXXXXXXXX"

VITE_CASHPLUS_BENEFICIARY="CashPlus Beneficiary Name"
VITE_CASHPLUS_PHONE="+212XXXXXXXXX"

# Application Configuration
VITE_APP_NAME="SindiBad"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="development"
```

## TypeScript Configuration

### Main Config ([`tsconfig.json`](tsconfig.json))
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### App Config ([`tsconfig.app.json`](tsconfig.app.json))
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["vite/client", "@types/estree", "node"],
    
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"],
  "exclude": ["src/services/quizService.ts"]
}
```

### Node Config ([`tsconfig.node.json`](tsconfig.node.json))
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true
  },
  "include": ["src", "vite.config.ts"]
}
```

## Vite Configuration

### Location: [`vite.config.ts`](vite.config.ts)

```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
```

**Configuration Breakdown**:
- **Plugins**: React plugin for Fast Refresh, Tailwind CSS for styling
- **Alias**: `@` maps to `src` directory for clean imports
- **Server**: Development server runs on port 5173

## Internationalization (i18n)

### Configuration: [`src/i18n.ts`](src/i18n.ts)

```typescript
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import fr from "./locales/fr.json"
import ar from "./locales/ar.json"

// Apply RTL/LTR direction based on language
const applyDirection = (language: string) => {
  const isRTL = language === 'ar'
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  document.documentElement.lang = language
  
  if (isRTL) {
    document.documentElement.classList.add('rtl')
  } else {
    document.documentElement.classList.remove('rtl')
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "ar"],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
  })

// Apply direction on init and language change
applyDirection(i18n.language)
i18n.on('languageChanged', applyDirection)

export default i18n
```

**Supported Languages**:
- French (`fr`) - Default
- Arabic (`ar`) - RTL support

**Translation Files**:
- [`src/locales/fr.json`](src/locales/fr.json)
- [`src/locales/ar.json`](src/locales/ar.json)

## UI Components Configuration

### shadcn/ui Config: [`components.json`](components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## Payment Configuration

### Location: [`src/config/payment.config.ts`](src/config/payment.config.ts)

```typescript
export const getPaymentConfig = () => ({
  logos: {
    bankLogo: '/payment-logos/bank.png',
    wafaCashLogo: '/payment-logos/wafacash.png',
    cashPlusLogo: '/payment-logos/cashplus.png'
  },
  bankAccount: {
    bankName: import.meta.env.VITE_BANK_NAME || '',
    iban: import.meta.env.VITE_BANK_IBAN || '',
    rib: import.meta.env.VITE_BANK_RIB || '',
    accountHolder: import.meta.env.VITE_BANK_ACCOUNT_HOLDER || ''
  },
  wafaCash: {
    beneficiary: import.meta.env.VITE_WAFACASH_BENEFICIARY || '',
    phoneNumber: import.meta.env.VITE_WAFACASH_PHONE || ''
  },
  cashPlus: {
    beneficiary: import.meta.env.VITE_CASHPLUS_BENEFICIARY || '',
    phoneNumber: import.meta.env.VITE_CASHPLUS_PHONE || ''
  }
})

export const validatePaymentConfig = () => {
  const config = getPaymentConfig()
  const requiredFields = [
    ['bankAccount.bankName', config.bankAccount.bankName],
    ['bankAccount.iban', config.bankAccount.iban],
    // ... other required fields
  ]
  
  const missingFields = requiredFields.filter(([, value]) => !value)
  if (missingFields.length > 0) {
    throw new Error(`Missing required payment configuration: ${missingFields.map(([key]) => key).join(', ')}`)
  }
  
  return config
}
```

### Payment Methods: [`src/config/paymentMethods.ts`](src/config/paymentMethods.ts)

```typescript
export interface PaymentMethod {
  id: string
  titleKey: string
  descriptionKey: string
  icon: React.ComponentType
  instructions: string[]
  config: 'bankAccount' | 'wafaCash' | 'cashPlus'
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bank-transfer',
    titleKey: 'payment.methods.bank.title',
    descriptionKey: 'payment.methods.bank.description',
    icon: Building,
    instructions: [
      'Connectez-vous à votre compte bancaire',
      'Sélectionnez l\'option de virement',
      'Saisissez les informations bancaires ci-dessous',
      'Gardez une copie du reçu'
    ],
    config: 'bankAccount'
  },
  // ... other payment methods
]
```

## Routing Configuration

### Location: [`src/routes/index.tsx`](src/routes/index.tsx)

```typescript
import { createBrowserRouter } from "react-router-dom"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "courses/:id", element: <CourseDetailsPage /> },
    ],
  },
  {
    path: "/admin",
    element: <ProtectedRoute requiredRole="ADMIN"><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <DashboardAdmin /> },
      { path: "courses", element: <AdminCoursesPage /> },
      { path: "courses/:id", element: <AdminCourseDetailsPage /> },
      { path: "courses/:id/chapters", element: <ChapterManager /> },
      { path: "quizzes", element: <QuizManagementPage /> },
    ],
  },
  {
    path: "/organisation",
    element: <ProtectedRoute requiredRole="ORGANISATION"><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <DashboardOrganisation /> },
      { path: "learners", element: <LearnersPage /> },
      { path: "courses", element: <OrganisationCoursesPage /> },
    ],
  },
  {
    path: "/learner",
    element: <ProtectedRoute requiredRole="LEARNER"><DashboardLayout /></ProtectedRoute>,
    children: [
      { path: "dashboard", element: <DashboardLearner /> },
      { path: "courses", element: <MyCourses /> },
      { path: "profile", element: <LearnerProfilePage /> },
    ],
  },
  {
    path: "/lessons/:courseId/:lessonId",
    element: <ProtectedRoute><LessonPage /></ProtectedRoute>,
  },
  {
    path: "/quiz/:quizId",
    element: <ProtectedRoute><QuizPage /></ProtectedRoute>,
  },
  // Auth routes
  { path: "/login", element: <SignInPage /> },
  { path: "/signup", element: <SignUpPage /> },
  { path: "/forgot-password", element: <ForgetPasswordPage /> },
])
```

## ESLint Configuration

### Location: [`eslint.config.js`](eslint.config.js)

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

## Docker Configuration

### Dockerfile: [`Dockerfile`](Dockerfile)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build || (echo "Build failed. Checking for path alias issues..." && ls -la src/ && exit 1)

# Stage 2: Production with Nginx
FROM nginx:stable-alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy build from stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Add Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration: [`nginx.conf`](nginx.conf)

```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - redirect all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## Jenkins Configuration

### Location: [`Jenkinsfile`](Jenkinsfile)

```groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        DOCKER_IMAGE = 'sindibad-frontend'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .'
                sh 'docker tag $DOCKER_IMAGE:$BUILD_NUMBER $DOCKER_IMAGE:latest'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}
```

## Package.json Scripts

### Location: [`package.json`](package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --emptyOutDir",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

**Script Descriptions**:
- `dev`: Start development server on port 5173
- `build`: Build production bundle to `/dist`
- `lint`: Run ESLint on all TypeScript files
- `preview`: Preview production build locally

## Git Configuration

### Location: [`.gitignore`](.gitignore)

```
# dependencies
node_modules
dist
dist-ssr
*.local

# environment
.env
.env.local
.env.production

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# editor
.vscode/*
!.vscode/launch.json
.idea

# OS
.DS_Store
Thumbs.db

# Build
*.tsbuildinfo
```

## VS Code Configuration

### Location: [`.vscode/launch.json`](.vscode/launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src",
      "userDataDir": "${workspaceFolder}/.vscode/chrome-debug-user-data"
    }
  ]
}
```

## Additional Configuration Files

### Index HTML: [`index.html`](index.html)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sindibad</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="preload"
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Poppins:wght@400;600&display=swap"
      as="style"
      onload="this.onload=null;this.rel='stylesheet'"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Main Entry: [`src/main.tsx`](src/main.tsx)

```typescript
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n.ts'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from './contexts/AuthContext'

const queryClient = new QueryClient()

// Initialize RTL direction based on stored language
const storedLanguage = localStorage.getItem('language') || 'fr'
document.documentElement.lang = storedLanguage
document.documentElement.dir = storedLanguage === 'ar' ? 'rtl' : 'ltr'

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </QueryClientProvider>
)
```

## Configuration Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Base URL**: Update for production deployment
3. **Payment Info**: Ensure all payment credentials are configured
4. **i18n**: Add translations for new features in both `fr.json` and `ar.json`
5. **TypeScript**: Keep strict mode enabled for type safety
6. **Docker**: Update nginx.conf if adding new routes
7. **Security**: Rotate JWT secrets regularly in backend configuration