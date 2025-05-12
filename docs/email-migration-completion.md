# Email Migration Completion Guide

This document outlines the remaining steps to complete Phase 4 (Cleanup and Finalization) of the email system migration.

## Current Status

- Phase 1 (Foundation): ✅ Completed
- Phase 2 (API Route Migration): ✅ Completed  
- Phase 3 (Component Integration): ✅ Completed
- Phase 4 (Cleanup and Finalization): 🚧 75% Complete

## Remaining Tasks

### 1. Update Components to Use New Server Actions

The following server actions have been created and should be used to replace direct API calls:

| API Route | New Server Action | Status |
|-----------|------------------|--------|
| `/api/auth/reset-password-confirm` | `confirmPasswordReset` in `app/actions/auth.js` | ✅ Created |
| `/api/admin/managers` | `sendAdminWelcomeEmail` in `app/actions/emailAdmin.js` | ✅ Created |
| `/api/orders/admin/[id]/email` | `sendOrderEmail` in `app/actions/orders.js` | ✅ Created |
| `/api/user/email-preferences` | `updateEmailPreferences` in `app/actions/emailPreferences.js` | ✅ Created |

Client components need to be updated to use these new server actions:

- `app/components/auth/PasswordResetForm.js`
- `app/components/admin/ManagerForm.js`
- `app/components/admin/OrderEmailForm.js`
- `app/components/user/EmailPreferencesForm.js`

### 2. Remove API Routes After Component Updates

Once the components have been updated, the following API routes can be deleted:

- `app/api/auth/reset-password-confirm/route.js`
- `app/api/admin/managers/route.js`
- `app/api/orders/admin/[id]/email/route.js`
- `app/api/user/email-preferences/route.js`

### 3. Remove Adapter Layer

After all components have been migrated, the adapter layer can be removed:

- `lib/email/emailAdapter.js`

Deprecation notices have already been added to all functions in the adapter to help identify any remaining usages.

### 4. Final Testing

Test all email functionality end-to-end to ensure proper operation:

1. Password reset flow
2. User registration and verification
3. Order email notifications
4. Admin and manager creation
5. Email preference updates 
6. Webhook email notifications

### 5. Monitoring

Implement monitoring for the email system:

1. Add structured logging for all email operations
2. Set up alerting for email sending failures
3. Create a dashboard for email sending metrics

## Migration Approach

For each remaining API route:

1. Find the client components that use the API route
2. Update each component to use the new server action
3. Test the component to ensure it works as expected
4. Delete the API route once all components are updated

## Example Migration

For `/api/auth/reset-password-confirm/route.js`:

**Before:**
```jsx
// In PasswordResetForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await fetch('/api/auth/reset-password-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    
    const data = await response.json();
    // Handle response
  } catch (error) {
    // Handle error
  }
};
```

**After:**
```jsx
'use client';
import { confirmPasswordReset } from '@/app/actions/auth';

// In PasswordResetForm.jsx
const handleSubmit = async (formData) => {
  setLoading(true);
  
  try {
    // Use the server action directly with form data
    const result = await confirmPasswordReset(formData);
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};

return (
  <form action={handleSubmit}>
    <input type="hidden" name="token" value={token} />
    <input type="password" name="password" />
    <button type="submit">Reset Password</button>
  </form>
);
```

## Timeline

Estimated time to complete Phase 4: 2-3 days of focused effort

1. Component updates: 1 day
2. API route removal: 0.5 day
3. Testing: 1 day
4. Monitoring implementation: 0.5 day 