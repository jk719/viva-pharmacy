# Email System Migration Plan

## Overview

This document outlines the step-by-step plan to migrate the Viva Pharmacy email system from the legacy approach to our new consolidated email system.

## Phase 1: Foundation (Completed ✅)

- ✅ Created base email template system (`emailBase.js`) with consistent styling
- ✅ Consolidated all email templates into a single file (`emailTemplates.js`)
- ✅ Integrated React Email components with our template system
- ✅ Enhanced security with proper headers, DKIM support, and rate limiting
- ✅ Created an adapter layer for backward compatibility

## Phase 2: API Route Migration (Completed ✅)

- ✅ Updated 8 API routes to use the adapter layer instead of directly importing from the old email system
- ✅ Added detailed comments to indicate these are transitional changes

## Phase 3: Component Integration (Completed ✅)

- ✅ Created server actions for email functionality
- ✅ Updated React components to use server actions instead of direct API calls
- ✅ Removed any inline email HTML in components
- ✅ Updated the email preview component to test all templates
- ✅ Added dynamic template loading and better sample data

## Phase 4: Cleanup and Finalization (In Progress 🔄)

### Step 1: Remove Legacy API Routes (In Progress 🔄)

- ✅ Create list of all API routes that can be replaced with server actions
- ✅ Create script to find and list email-related API routes
- ✅ Create script to safely remove and backup migrated API routes

#### Email API Routes to Migrate

| Status | Route Path | File | Methods | Description |
|--------|------------|------|---------|-------------|
| ✅ | `/api/admin/email/test` | `app/api/admin/email/test/route.js` | POST | Test email endpoint (migrated & removed) |
| ✅ | `/api/auth/verify-email` | `app/api/auth/verify-email/route.js` | GET, POST | Email verification (migrated & removed) |
| ⬜ | `/api/user/email-preferences` | `app/api/user/email-preferences/route.js` | GET, PUT | Email preferences |
| ✅ | `/api/auth/forgot-password` | `app/api/auth/forgot-password/route.js` | POST | Password reset request (migrated & removed) |
| ✅ | `/api/auth/reset-password` | `app/api/auth/reset-password/route.js` | POST | Password reset confirmation (migrated & removed) |
| ✅ | `/api/auth/register` | `app/api/auth/register/route.js` | POST | User registration (migrated & removed) |
| ✅ | `/api/auth/resend-verification` | `app/api/auth/resend-verification/route.js` | POST | Resend verification email (migrated & removed) |
| ⬜ | `/api/orders/admin/[id]/email` | `app/api/orders/admin/[id]/email/route.js` | POST | Send order email |
| ⬜ | `/api/webhook` | `app/api/webhook/route.js` | POST | Payment webhook (generates emails) |
| ⬜ | `/api/webhooks/stripe` | `app/api/webhooks/stripe/route.js` | POST | Stripe webhook (sends confirmation emails) |
| ⬜ | `/api/admin/managers` | `app/api/admin/managers/route.js` | POST | Create manager (sends welcome email) |

- ✅ Update forgot-password and reset-password components to use server actions
- ✅ Update register and verify-email components to use server actions
- ✅ Update VerificationAlert component to use server actions
- ✅ Remove migrated API routes with proper backups
- ⬜ Update remaining components to use server actions
- ⬜ Delete remaining legacy API routes once they're no longer in use

### Next Target: Order and Webhook Emails

The next routes to migrate:
- ⬜ `/api/orders/admin/[id]/email` - Send order email
- ⬜ `/api/webhook` - Payment webhook (generates emails)
- ⬜ `/api/webhooks/stripe` - Stripe webhook (sends confirmation emails)

### Step 2: Remove Legacy Email Files

- ⬜ Delete old email template files:
  - ⬜ `lib/email/templates/*`
  - ⬜ `lib/email/legacy/*`
  - ⬜ `components/emails/oldTemplates/*`

- ⬜ Remove unused utility functions:
  - ⬜ `lib/email/utils.js` 
  - ⬜ `lib/email/sendEmail.js` (after adapter calls are removed)

### Step 3: Remove Adapter Layer

- ⬜ Identify all imports from the adapter layer
  - ⬜ `sendPasswordResetEmail` 
  - ⬜ `sendVerificationEmail`
  - ⬜ `sendAdminWelcomeEmail`
  - ⬜ `sendOrderEmail`
  - ⬜ `sendOrderConfirmationEmail`

- ⬜ Replace adapter imports with direct emailService imports
- ⬜ Delete the adapter layer file (`emailAdapter.js`)

### Step 4: Documentation Updates

- ⬜ Update all relevant documentation with new email system instructions
- ⬜ Add code examples for common email scenarios
- ⬜ Create unit tests for the email system

### Step 5: Monitoring & Validation

- ⬜ Implement monitoring for email deliverability
- ⬜ Create a dashboard for email statistics
- ⬜ Set up alerts for email failures

## Timeline

- **Phase 4 Step 1**: Remove legacy API routes - 1 week (60% complete)
- **Phase 4 Step 2**: Remove legacy email files - 1 week
- **Phase 4 Step 3**: Remove adapter layer - 1 week
- **Phase 4 Step 4**: Documentation updates - 2 days
- **Phase 4 Step 5**: Monitoring & validation - 2 days

**Total Phase 4 Duration**: Approximately 3 weeks

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking changes for existing functionality | Medium | High | Comprehensive testing before removing any files |
| Email deliverability issues | Low | High | Thorough testing of all templates, maintain DKIM/SPF records |
| Increased complexity for developers | Low | Medium | Clear documentation and examples |
| Performance regression | Low | Medium | Benchmark email sending before and after changes |

## Success Criteria

- All emails are sent through the consolidated system
- No legacy email code remains in the codebase
- All components use server actions for email functionality
- Documentation is complete and up-to-date
- Email sending performance is maintained or improved 