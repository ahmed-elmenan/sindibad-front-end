# RUN_PROJECT.md

# How to Run the Project

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v20 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Docker** (optional): For containerized deployment
- **VS Code** (recommended): For development

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd front-end-web-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages from [`package.json`](package.json).

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If example file exists
# Or create manually:
touch .env
```

Add the following configuration to `.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Payment Configuration (get from admin)
VITE_BANK_NAME="Your Bank Name"
VITE_BANK_IBAN="YOUR_IBAN"
VITE_BANK_RIB="YOUR_RIB"
VITE_BANK_ACCOUNT_HOLDER="Account Holder"

VITE_WAFACASH_BENEFICIARY="WafaCash Name"
VITE_WAFACASH_PHONE="+212XXXXXXXXX"

VITE_CASHPLUS_BENEFICIARY="CashPlus Name"
VITE_CASHPLUS_PHONE="+212XXXXXXXXX"
```

**Important**: Update `VITE_API_BASE_URL` to match your backend API URL.

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at:
- **URL**: http://localhost:5173
- **Network**: http://192.168.x.x:5173 (for mobile testing)

**Development Features**:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Source maps for debugging
- Detailed error messages

### Production Build

Build the application for production:

```bash
npm run build
```

This creates an optimized production bundle in the `/dist` directory.

**Build Output**:
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-assets]
├── index.html
└── [static-files]
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

Access at: http://localhost:4173

## Docker Deployment

### Build Docker Image

```bash
docker build -t sindibad-frontend .
```

### Run Docker Container

```bash
docker run -p 3000:3000 sindibad-frontend
```

Access at: http://localhost:3000

### Docker Compose (if available)

```bash
docker-compose up -d
```

## Development Workflow

### Project Structure Overview

```
src/
├── components/     # UI components
├── pages/          # Page components
├── services/       # API services
├── hooks/          # Custom hooks
├── contexts/       # React contexts
├── routes/         # Route definitions
├── locales/        # i18n translations
├── types/          # TypeScript types
└── lib/            # Utilities
```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Make your changes** in the `src/` directory

4. **Test your changes** in the browser

5. **Lint your code**:
   ```bash
   npm run lint
   ```

6. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

7. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Adding New Features

#### Adding a New Page

1. Create page component in `src/pages/`:
   ```typescript
   // src/pages/NewPage.tsx
   export default function NewPage() {
     return <div>New Page</div>
   }
   ```

2. Add route in [`src/routes/index.tsx`](src/routes/index.tsx):
   ```typescript
   {
     path: "/new-page",
     element: <NewPage />
   }
   ```

3. Add translations in `src/locales/fr.json` and `src/locales/ar.json`

#### Adding a New API Service

1. Create service file in `src/services/`:
   ```typescript
   // src/services/feature.service.ts
   import api from '@/lib/axios'
   
   export const getFeatureData = async () => {
     const response = await api.get('/feature')
     return response.data
   }
   ```

2. Use in component with React Query:
   ```typescript
   const { data, isLoading } = useQuery({
     queryKey: ['feature'],
     queryFn: getFeatureData
   })
   ```

#### Adding a New UI Component

1. Create component in `src/components/`:
   ```typescript
   // src/components/MyComponent.tsx
   export function MyComponent({ prop }: Props) {
     return <div>{prop}</div>
   }
   ```

2. Use in pages or other components:
   ```typescript
   import { MyComponent } from '@/components/MyComponent'
   ```

### Testing Different User Roles

The application supports three user roles:

1. **Admin**: Full system access
   - Login at `/login` with admin credentials
   - Access admin dashboard at `/admin/dashboard`

2. **Organization**: Manage learners and courses
   - Login at `/login` with organization credentials
   - Access dashboard at `/organisation/dashboard`

3. **Learner**: Take courses and quizzes
   - Login at `/login` with learner credentials
   - Access dashboard at `/learner/dashboard`

### Language Testing

Switch between languages:
- Use the language selector in the navigation bar
- French (default): LTR layout
- Arabic: RTL layout with appropriate text alignment

## Debugging

### VS Code Debugging

1. Press `F5` or go to Run → Start Debugging
2. Select "Launch Chrome against localhost"
3. Set breakpoints in your code
4. Debug in VS Code with full source maps

Configuration in [`.vscode/launch.json`](.vscode/launch.json).

### Browser DevTools

1. Open Chrome DevTools (`F12`)
2. Go to Sources tab
3. Find your source files under `webpack://`
4. Set breakpoints and debug

### React Developer Tools

Install React DevTools extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## Common Issues and Solutions

### Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Find and kill process using the port
# macOS/Linux:
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Module Not Found

**Error**: `Cannot find module '@/...'`

**Solution**:
1. Check if file exists
2. Restart dev server
3. Clear cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### API Connection Issues

**Error**: Network requests failing

**Solution**:
1. Check backend is running
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check CORS configuration on backend
4. Inspect network tab in DevTools

### Build Failures

**Error**: Build fails with TypeScript errors

**Solution**:
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix or ignore specific errors
# Update tsconfig.json or fix the issues
```

### Docker Build Issues

**Error**: Docker build fails

**Solution**:
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t sindibad-frontend .
```

## Testing

### Manual Testing Checklist

Before committing changes:

- [ ] Login/Logout works for all roles
- [ ] Course enrollment flow works
- [ ] Quiz taking and submission works
- [ ] Video playback functions correctly
- [ ] Language switching works (FR/AR)
- [ ] Mobile responsive design looks good
- [ ] No console errors in browser
- [ ] All forms validate correctly

### Testing on Mobile

1. Start dev server
2. Find your local IP: `ifconfig` (macOS/Linux) or `ipconfig` (Windows)
3. Access from mobile: `http://YOUR_IP:5173`
4. Test touch interactions and responsive layout

## Performance Optimization

### Analyzing Bundle Size

```bash
npm run build

# Check bundle size in dist/assets/
ls -lh dist/assets/
```

### Checking Performance

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run performance audit
4. Review suggestions

## Deployment

### Production Deployment Checklist

Before deploying to production:

- [ ] Update `.env` with production API URL
- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Check all environment variables are set
- [ ] Verify payment configuration
- [ ] Update CORS settings on backend
- [ ] Configure nginx for SPA routing
- [ ] Set up SSL/HTTPS
- [ ] Configure domain DNS

### Deployment Commands

```bash
# Build for production
npm run build

# Deploy dist/ directory to your hosting service
# Example: Netlify, Vercel, AWS S3, etc.

# Or use Docker
docker build -t sindibad-frontend .
docker push your-registry/sindibad-frontend:latest
```

## Useful Commands

```bash
# Install new package
npm install package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Run linter
npm run lint

# Format code (if prettier configured)
npm run format

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

### Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Query**: https://tanstack.com/query/latest

### Project-Specific Help

- Check existing issues in the repository
- Review the codebase documentation
- Ask team members on Slack/Teams
- Create a new issue with detailed information

## Next Steps

After setting up the project:

1. Explore the codebase structure
2. Review the architecture documentation
3. Understand the API flow
4. Try creating a simple feature
5. Familiarize yourself with the component library
6. Test different user roles and features

Happy coding! 🚀