# Viva Pharmacy Email System Documentation

This document outlines the new consolidated email system architecture implemented in the Viva Pharmacy application.

## Overview

The email system was reengineered to address several issues with the previous implementation:

1. Inconsistent styling across different email types
2. Fragmented code with multiple implementations
3. Lack of standardized templates
4. Security and deliverability concerns
5. Difficult maintenance due to scattered code

The new system provides:

- Consistent styling and branding across all emails
- Centralized template management
- Enhanced security with DKIM support
- Rate limiting to prevent spam/abuse
- Improved deliverability and tracking

## Architecture

The email system follows a layered architecture:

1. **Templates Layer**: React Email components with consistent styling
2. **Service Layer**: Core email service with template rendering and sending capabilities
3. **Queue Layer**: Optional message queue for high-volume scenarios
4. **Server Actions Layer**: Next.js server actions for client components to trigger emails
5. **Adapter Layer**: (Temporary) Backward compatibility layer for transition

```
┌─────────────────────────────────────────┐
│           React Components              │
└───────────────────┬─────────────────────┘
                    │ Calls
                    ▼
┌─────────────────────────────────────────┐
│            Server Actions               │
└───────────────────┬─────────────────────┘
                    │ Uses
                    ▼
┌─────────────────────────────────────────┐
│            Email Service                │
└───────────────────┬─────────────────────┘
                    │ Renders
                    ▼
┌─────────────────────────────────────────┐
│         Email Templates                 │
└─────────────────────────────────────────┘
```

## Key Components

### Email Templates (`lib/email/templates/`)

React Email components for each email type with consistent styling.

### Email Service (`lib/email/emailService.js`)

Core service that handles:
- Template selection and rendering
- Email sending via Nodemailer
- Security features (DKIM, TLS)
- Rate limiting and throttling

### Server Actions (`app/actions/`)

Next.js server actions that provide:
- Authentication and authorization checks
- Input validation
- Business logic before sending emails
- Structured responses for client components

Key server action files:
- `email.js`: Generic email actions
- `auth.js`: Authentication-related emails
- `orders.js`: Order confirmation and updates
- `emailPreferences.js`: User email preference management
- `webhooks.js`: External service integrations

## Usage Examples

### Sending an Email from a React Component

```jsx
'use client';
import { sendOrderEmail } from '@/app/actions/orders';

export default function OrderEmailForm({ orderId }) {
  const handleSubmit = async (formData) => {
    formData.append('orderId', orderId);
    const result = await sendOrderEmail(formData);
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  return (
    <form action={handleSubmit}>
      <textarea name="content" placeholder="Email content..." />
      <button type="submit">Send Email</button>
    </form>
  );
}
```

### Adding a New Email Template

1. Create a new React Email template in `lib/email/templates/`
2. Add the template to the template registry in `emailService.js`
3. Create a specific method in `emailService.js` for sending this type of email
4. Create a server action in the appropriate actions file

## Security Considerations

- All emails use DKIM signatures for authenticity
- Rate limiting prevents abuse
- Server actions enforce authentication and authorization
- Secure TLS connections for SMTP
- No sensitive data stored in email templates

## Monitoring and Troubleshooting

Email sending logs are available in:
- Application logs with detailed status information
- SMTP transaction logs for delivery issues
- Server action response tracking

Common issues:
- Check SMTP configuration for connection problems
- Verify template data for rendering issues
- Check rate limits if emails are delayed
- Review server action responses for validation errors

## Migration Status

The email system migration was completed in four phases:

1. **Phase 1: Foundation** - Template system and adapter layer
2. **Phase 2: API Route Migration** - Updated API routes to use adapter
3. **Phase 3: Component Integration** - Server actions and React component updates
4. **Phase 4: Cleanup and Finalization** - Removal of legacy code and adapter layer

The migration has successfully consolidated multiple email implementations while maintaining backward compatibility during transition.

## Future Improvements

- Enhanced email analytics and tracking
- A/B testing capability for email templates
- Advanced personalization features
- Scheduled emails and campaigns
- Better integration with CRM systems 