# Email System Migration Guide

This document outlines the steps to migrate from the old email system to the new consolidated email system.

## Background

The original email system had several issues:
- Duplicate email templates in multiple locations
- Inconsistent styling between emails
- Redundant code across templates
- Multiple email sending mechanisms

The new system provides:
- Centralized email templates in `lib/email/emailTemplates.js`
- Consistent styling using a base template in `lib/email/emailBase.js`
- Enhanced security features
- Improved testing capabilities

## Migration Overview

We've created a transition path that allows for incremental migration:

1. The new system is ready to use in `lib/email/emailService.js`
2. An adapter (`lib/email/emailAdapter.js`) provides backward compatibility
3. You can use both systems simultaneously during migration
4. Once all code is migrated, the old system can be removed

## Migration Steps for Developers

### Step 1: Update Import Paths

Replace imports from the old system with the new system:

```diff
- import { sendVerificationEmail } from '@/lib/email/sendEmail';
+ import { sendVerificationEmail } from '@/lib/email/emailAdapter';
```

Or better yet, use the service directly:

```diff
- import { sendVerificationEmail } from '@/lib/email/sendEmail';
+ import { emailService } from '@/lib/email/emailService';

// Then use:
- await sendVerificationEmail(email, token);
+ await emailService.sendVerificationEmail(email, token);
```

### Step 2: Migrate Template Usage

If you're using direct HTML in your code, convert it to use the new template system:

```diff
- const emailHtml = `
-   <div>
-     <h1>Hello ${user.name}</h1>
-     <p>Your order has been confirmed.</p>
-   </div>
- `;
- await sendEmail({ to: user.email, subject: 'Order Confirmed', html: emailHtml });

+ // Use the service instead
+ await emailService.sendOrderConfirmationEmail(user, orderData);
```

### Step 3: Add Missing Templates

If you need a template that doesn't exist yet, add it to `lib/email/emailTemplates.js` following the established pattern:

```javascript
// Add your new template
myNewTemplate: (data) => {
  const content = `
    ${EmailComponents.header('Your Template Title')}
    
    <div class="content">
      <p>Hello ${data.name},</p>
      <p>Your custom message here.</p>
      
      ${EmailComponents.button('Action Button', data.actionUrl)}
    </div>
  `;
  
  return {
    subject: 'Your Email Subject',
    html: wrapInBaseTemplate(content, {
      preheader: 'Email preview text here'
    })
  };
}
```

Then add a method to the `emailService` for easy usage:

```javascript
async sendMyNewEmail(user, customData) {
  return this.sendEmail(user.email, 'myNewTemplate', {
    name: user.name,
    ...customData
  });
}
```

## Verification Process

1. Test email templates in the admin preview interface
2. Use the test email functionality to send real test emails
3. Verify styling is consistent across email clients
4. Check all features: buttons, images, responsive layout

## Timeline

1. **Phase 1 (Current)**: Setup dual system, begin using adapter
2. **Phase 2 (1-2 weeks)**: Migrate all direct usage to service
3. **Phase 3 (2-4 weeks)**: Remove adapter, delete old system

## Files to Eventually Remove

Once the migration is complete, these files can be deleted:

- `lib/email/sendEmail.js`
- `lib/email/orderNotifications.js`
- `lib/email/emailAdapter.js` (after migration)
- `lib/email-templates/` (entire directory)

## Need Help?

If you're unsure how to migrate a specific email functionality, contact the development team for assistance. 