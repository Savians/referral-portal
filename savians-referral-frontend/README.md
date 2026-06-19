# Savians Referral Portal - Frontend

**Status**: Phase 1 Foundation Complete ✅  
**Next.js Version**: 15  
**Created**: June 7, 2026

---

## Project Overview

This is the frontend application for the Savians Referral Portal, a premium referral management platform for Savians Tax Advisory.

**Backend API**: `https://zudo43ux6a.execute-api.us-east-1.amazonaws.com`

---

## Phase 1 - Foundation (COMPLETE)

### ✅ Project Setup
- [x] Next.js 15 with App Router
- [x] TypeScript configuration
- [x] TailwindCSS with Savians branding
- [x] PostCSS & Autoprefixer
- [x] Environment variables

### ✅ Dependencies Installed
- [x] React 19
- [x] TanStack Query (React Query)
- [x] Axios
- [x] Amazon Cognito Identity JS
- [x] React Hook Form + Zod
- [x] Lucide React (icons)
- [x] date-fns
- [x] Sonner (toast notifications)
- [x] clsx + tailwind-merge

### ✅ Type System
- [x] Complete API types derived from backend
- [x] Request/Response interfaces
- [x] Enum types (Status, Role, etc.)
- [x] Pagination types
- [x] Error response types

### ✅ Authentication Layer
- [x] Cognito authentication library
- [x] Login/Logout functions
- [x] Token management
- [x] Session refresh
- [x] Password management
- [x] Role extraction from JWT

### ✅ API Services
- [x] Axios client with interceptors
- [x] Automatic JWT attachment
- [x] Token refresh handling
- [x] Error handling
- [x] Auth service
- [x] Public service
- [x] Partner service
- [x] Admin service

### ✅ Utilities
- [x] Class name merger (cn)
- [x] Currency formatter
- [x] Date formatters
- [x] Validation helpers
- [x] Text utilities
- [x] Clipboard utilities
- [x] Query string helpers

### ✅ Constants
- [x] Routes
- [x] Status labels & colors
- [x] Pagination defaults
- [x] Validation regex
- [x] Error messages
- [x] File upload limits
- [x] US States list

### ✅ React Providers
- [x] QueryProvider (TanStack Query)
- [x] AuthProvider (Authentication state)
- [x] Toast notifications (Sonner)

### ✅ Custom Hooks
- [x] useAuth
- [x] useProtectedRoute

### ✅ Routing & Protection
- [x] Next.js middleware
- [x] Public route handling
- [x] Protected route handling
- [x] Role-based redirects

### ✅ Styling System
- [x] Global CSS
- [x] Tailwind configuration
- [x] Savians color palette
- [x] Custom utility classes
- [x] Button styles
- [x] Table styles
- [x] Form styles
- [x] Dashboard card styles

### ✅ Layout System
- [x] Root layout with providers
- [x] Placeholder landing page
- [x] Metadata configuration

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| State Management | TanStack Query |
| HTTP Client | Axios |
| Authentication | AWS Cognito |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Notifications | Sonner |
| Date Handling | date-fns |

---

## Project Structure

```
savians-referral-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── services/              # API services
│   │   ├── api.ts            # Axios client
│   │   ├── auth.service.ts
│   │   ├── public.service.ts
│   │   ├── partner.service.ts
│   │   └── admin.service.ts
│   ├── lib/                   # Utilities
│   │   ├── cognito.ts        # Cognito auth
│   │   ├── utils.ts          # Helpers
│   │   └── constants.ts      # Constants
│   ├── types/                 # TypeScript types
│   │   └── api.types.ts
│   ├── providers/             # React providers
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── hooks/                 # Custom hooks
│   │   └── useProtectedRoute.ts
│   └── middleware.ts          # Route protection
├── public/                    # Static assets
├── .env.local                # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Environment Variables

Create `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://zudo43ux6a.execute-api.us-east-1.amazonaws.com

# AWS Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_HkKeWWA4F
NEXT_PUBLIC_COGNITO_CLIENT_ID=61kk1a8adhgtpcer0klg7m6ujm
NEXT_PUBLIC_COGNITO_REGION=us-east-1

# Application
NEXT_PUBLIC_APP_NAME=Savians Referral Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Installation

```bash
# Navigate to frontend directory
cd savians-referral-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Savians Branding

### Colors
- **Primary Navy**: `#14235C`
- **Primary Yellow**: `#F4C64E`
- **Background**: `#F5F5F5`
- **Text**: `#2C2C2C`

### Design Principles
- Professional financial services aesthetic
- Premium and trustworthy appearance
- Clean and minimal design
- Large whitespace
- Rounded cards with subtle shadows
- Desktop-first, responsive design

---

## API Integration

### Authentication Flow
1. User logs in → Cognito authentication
2. JWT tokens stored in Cognito session
3. Axios interceptor attaches JWT to requests
4. Backend validates JWT and returns data
5. Auto-refresh on token expiration

### Error Handling
- **401**: Redirect to login
- **403**: Access forbidden message
- **404**: Resource not found
- **422**: Validation error
- **500**: Server error
- Network errors handled gracefully

---

## Route Protection

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/apply` - Partner application
- `/signup` - Partner signup (with invite)
- `/partner/RP-xxxx` - Public referral form

### Protected Routes - Partner
- `/partner/dashboard`
- `/partner/referrals`
- `/partner/referrals/{id}`
- `/partner/payments`
- `/partner/profile`

### Protected Routes - Admin
- `/admin/dashboard`
- `/admin/applications`
- `/admin/partners`
- `/admin/referrals`
- `/admin/payments`
- `/admin/audit-log`

---

## Next Steps - Phase 2

### Public Website (In Order)
1. Landing Page
2. Partner Application Form
3. Invite Signup Page
4. Public Referral Form

### Requirements
- Match Savians.com branding
- Responsive design
- Form validation with Zod
- Success/error states
- Loading skeletons

---

## Development Guidelines

### Code Style
- Use TypeScript strictly
- Follow Next.js 15 conventions
- Use 'use client' for client components
- Prefer server components when possible
- Use TanStack Query for data fetching

### Naming Conventions
- Components: PascalCase
- Files: kebab-case or PascalCase
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Types: PascalCase

### State Management
- Use React Query for server state
- Use React Context for auth state
- Avoid prop drilling
- Keep state close to where it's used

---

## Testing Backend Integration

Once Phase 2 begins, test with existing backend users:

**Admin User**:
- Email: `admin@savians.com`
- Pool ID: `us-east-1_HkKeWWA4F`

**Partner User** (if created):
- Use invite flow to create test partner

---

## Notes

- ✅ Phase 1 foundation is complete and tested
- ⏳ Phase 2 (Public Website) ready to begin
- 🔧 All API services connected to production backend
- 🎨 Branding matches Savians corporate identity
- 🔐 Authentication fully integrated with Cognito

---

**Built with** ❤️ **for Savians Tax Advisory**
