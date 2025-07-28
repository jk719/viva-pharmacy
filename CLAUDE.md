# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Development
```bash
npm run dev              # Start development server on 0.0.0.0
npm run dev:clean        # Clean start (removes .next and reinstalls)
npm run dev:mobile       # Development server on port 3001 for mobile testing
```

### Build & Production
```bash
npm run build            # Production build (ESLint errors ignored)
npm run build:debug      # Build with increased memory allocation
npm run start            # Start production server
```

### Testing & Quality
```bash
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking (tsc --noEmit)
npm run test:integration # Run integration tests with Jest
npm run test:watch       # Jest in watch mode
npm run test:coverage    # Test coverage report

# Run a single test file:
npx jest path/to/test.js
# Run tests matching a pattern:
npx jest --testNamePattern="should create order"
```

### Database & Migration Scripts
```bash
npm run cleanup-orders        # Remove duplicate orders
npm run migrate:loyalty       # Migrate loyalty schema
npm run update-stock         # Update product stock levels
npm run enhance-products     # Enhance product data
npm run verify-products      # Verify product integrity
```

### Cloudinary/Image Management
```bash
npm run migrate:cloudinary   # Migrate images to Cloudinary
npm run sync:cloudinary      # Sync Cloudinary URLs to MongoDB
npm run verify-cloudinary    # Verify Cloudinary URLs
```

### Maintenance
```bash
npm run clean            # Clean build artifacts
npm run clean:hard       # Full reset (removes node_modules)
npm run cache:clear      # Clear Next.js cache
```

## High-Level Architecture

### Core Technologies
- **Framework**: Next.js 15.1.3 with App Router (React 19)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT strategy
- **State Management**: Zustand for global state, React Context for UI state
- **Styling**: Tailwind CSS with custom design system
- **Payments**: Stripe integration
- **File Storage**: Cloudinary (images), AWS S3 (prescriptions)
- **Email**: Multiple providers (Resend primary, SendGrid/Nodemailer fallback)
- **SMS**: Twilio for notifications
- **Analytics**: Google Analytics + custom event tracking

### Directory Structure & Key Patterns

```
app/                    # Next.js App Router
├── actions/           # Server actions for forms (Next.js 15 pattern)
├── api/              # REST API endpoints
│   ├── admin/        # Admin-only endpoints (role-based auth)
│   ├── auth/         # NextAuth configuration
│   ├── loyalty/      # VivaBucks loyalty system
│   └── stripe/       # Payment webhooks
├── admin/            # Admin dashboard (protected routes)
└── (public routes)   # Cart, checkout, products, profile

components/           # React components
├── admin/           # Admin-specific components
├── loyalty/         # Loyalty program UI (LoyaltyBanner, etc.)
└── shared/          # Reusable components

lib/                 # Core business logic
├── api/            # API helpers (centralized error handling)
├── auth/           # Authentication utilities
├── constants/      # Centralized constants (timing, styles)
├── hooks/          # Custom React hooks
├── loyalty/        # Points calculation, tier management
└── utils/          # Shared utilities

models/             # Mongoose schemas
scripts/            # Database migrations, maintenance
```

### Key Architectural Patterns

1. **Server Components by Default**
   - Use `'use client'` only when needed for interactivity
   - Server actions for form submissions (no API routes needed)
   - Streaming and suspense for better performance

2. **Centralized Error Handling**
   ```javascript
   // All API routes use lib/api/apiHelpers.js
   import { withAuth, handleApiError } from '@/lib/api/apiHelpers';
   
   export async function GET(request) {
     return withAuth(request, async (session) => {
       // Implementation
     });
   }
   ```

3. **Unified Form Management**
   ```javascript
   // All forms use the useFormHandler hook
   import { useFormHandler } from '@/lib/hooks/useFormHandler';
   
   const { loading, error, submitForm } = useFormHandler();
   ```

4. **Loyalty System Architecture**
   - Event-driven point calculations
   - Real-time updates via Server-Sent Events (SSE)
   - Optimistic UI updates with SWR
   - Transaction-based tracking for audit trail

5. **Authentication Flow**
   - NextAuth with custom JWT strategy
   - Role-based access (user, admin, manager)
   - Protected API routes and pages
   - Session validation in middleware

6. **State Management Strategy**
   - Zustand for global state (cart, loyalty points)
   - SWR for server state and caching
   - React Context for UI state (modals, announcements)
   - Local state for component-specific data

7. **Performance Optimizations**
   - Image optimization with Cloudinary transformations
   - Dynamic imports for code splitting
   - Proper MongoDB indexing
   - Redis caching (optional)
   - Centralized timing constants for consistency

### Recent Optimizations (2025)

1. **100% Duplicate-Free Codebase**
   - All utilities consolidated in lib/utils/
   - Custom hooks for common patterns
   - Centralized API helpers

2. **Standardized Constants**
   - Timing values in lib/constants/timing.js
   - Style constants for consistent spacing
   - Environment-aware logging utility

3. **Improved Error Handling**
   - Consistent error response format
   - Proper HTTP status codes
   - User-friendly error messages

4. **Loyalty System Refactor**
   - Zustand store for state management (lib/loyalty/loyaltyStore.js)
   - Transaction-based tracking with audit trail
   - Event-driven architecture for decoupling
   - Backward compatibility wrapper for legacy components

### Critical Integration Points

1. **Stripe Webhook Handler**
   - Location: app/api/stripe/webhook/route.js
   - Handles payment confirmations and updates orders
   - Updates loyalty points on successful payments

2. **Prescription Upload Flow**
   - Upload to AWS S3 with presigned URLs
   - Admin verification system
   - Order linking and tracking

3. **Email System**
   - Primary: Resend API
   - Fallback: SendGrid → Nodemailer
   - Templates in lib/email/templates/

4. **Real-time Updates**
   - SSE endpoint: app/api/loyalty/events/route.js
   - Client hook: useSSE in components
   - Handles loyalty updates, announcements

### Environment Variables Structure

Required variables are defined in .env.local:
- Database: MONGODB_URI
- Auth: NEXTAUTH_SECRET, NEXTAUTH_URL
- Payments: STRIPE_* keys
- Storage: CLOUDINARY_*, AWS_* credentials
- Communications: RESEND_API_KEY, TWILIO_*
- Analytics: GA_MEASUREMENT_ID

Note: Node.js version must be >= 20.0.0 and < 21.0.0 (specified in package.json engines)

### Common Development Patterns

1. **Adding New API Endpoints**
   ```javascript
   // Use the withAuth wrapper for protected routes
   import { withAuth } from '@/lib/api/apiHelpers';
   
   export async function GET(request) {
     return withAuth(request, async (session) => {
       // Your logic here
     }, { requiredRole: 'admin' }); // Optional role check
   }
   ```

2. **Database Operations**
   ```javascript
   // Always use connectDB before operations
   import { connectDB } from '@/lib/mongodb';
   import Model from '@/models/Model';
   
   await connectDB();
   const data = await Model.find({}).lean();
   ```

3. **Client-Side Data Fetching**
   ```javascript
   // Use SWR for caching and revalidation
   import useSWR from 'swr';
   
   const { data, error, mutate } = useSWR('/api/endpoint', fetcher);
   ```

### Testing Strategy

- **Unit Tests**: Business logic in lib/
- **Integration Tests**: API endpoints and database operations  
- **Test Structure**: __tests__/integration/ directory
- **Test Framework**: Jest with next/jest configuration
- **Test Environment**: jest-environment-jsdom
- **Mocking**: Database connections and external services
- **Module Aliases**: Configured for @/components, @/lib, @/models

### Performance Considerations

1. Use `dynamic()` imports for heavy components
2. Implement proper caching headers
3. Optimize images with Cloudinary transformations
4. Use MongoDB indexes for frequent queries
5. Implement pagination for large datasets

### Security Best Practices

1. All sensitive operations require authentication
2. Role-based access control on admin routes
3. Input validation on all API endpoints
4. Rate limiting implemented with useRateLimit hook
5. Secure headers configured in next.config.mjs
6. Environment variables never exposed to client