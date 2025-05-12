# Viva Pharmacy Email System

This directory contains the consolidated email system for Viva Pharmacy. The system provides a robust, secure, and consistent way to send emails throughout the application.

## Architecture

The email system uses a layered architecture:

1. **Core Email Service** (`emailService.js`): Handles email sending, security, and rate limiting.
2. **Email Templates** (`emailTemplates.js`): Contains all email templates for the application.
3. **Base Templates** (`emailBase.js`): Provides consistent styling and layout for all emails.
4. **React Email Components** (`components/emails/`): React components for complex emails.
5. **Server Actions** (`app/actions/`): Server actions for client components to interact with the email system.
6. **Adapter Layer** (`emailAdapter.js`): Provides backward compatibility for legacy code.

## How to Use

### Sending Emails from Server Components or API Routes

```javascript
import { emailService } from '@/lib/email/emailService';

// Example: Sending a points earned email
await emailService.sendPointsEarnedEmail(user, {
  earned: 50,
  total: 550,
  tier: 'Silver',
  nextTierProgress: 250,
  nextTier: 'Gold'
});
```

### Sending Emails from Client Components

Use server actions:

```javascript
'use client';
import { sendLoyaltyEmail } from '@/app/actions/email';

// In a component event handler
const handleReward = async (userId) => {
  const result = await sendLoyaltyEmail('points-earned', { 
    email: user.email,
    name: user.name
  }, {
    earned: 50,
    total: 300
  });
  
  if (result.success) {
    // Show success message
  }
};
```

## Adding a New Email Template

1. **Add the template function to `emailTemplates.js`**:

```javascript
myNewTemplate: (data) => {
  const content = `
    ${EmailComponents.header('My New Email Subject')}
    
    <div class="content">
      <p>Hello ${data.name},</p>
      <p>Your custom content here...</p>
    </div>
  `;
  
  return {
    subject: 'My New Email Subject',
    html: wrapInBaseTemplate(content)
  };
}
```

2. **Add a helper method in `emailService.js`**:

```javascript
async sendMyNewEmail(user, customData) {
  return this.sendEmail(user.email, 'myNewTemplate', {
    name: user.name,
    ...customData
  });
}
```

3. **Add sample data in `sampleData.js`** for testing:

```javascript
myNewTemplate: {
  name: 'John Doe',
  // ... other required fields for the template
}
```

## Creating a React Email Template

For complex emails, use React Email:

1. Create a new component in `components/emails/`:

```jsx
// MyNewEmailTemplate.jsx
import { 
  Html, Head, Preview, Body, Container, 
  Section, Text, Button, Img, Hr 
} from '@react-email/components';

export default function MyNewEmailTemplate({ name, customData }) {
  return (
    <Html>
      <Head />
      <Preview>Your email preview text</Preview>
      <Body style={styles.body}>
        <Container>
          <Section>
            <Text>Hello {name},</Text>
            <Text>Your custom content here...</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f6f9fc',
    margin: '0'
  }
};
```

2. Register it in `emailTemplates.js`:

```javascript
import { createTemplateFromReactEmail } from './renderReactEmail';
import MyNewEmailTemplate from '@/components/emails/MyNewEmailTemplate';

// In the emailTemplates object:
reactMyNewEmail: createTemplateFromReactEmail(
  MyNewEmailTemplate,
  (data) => `My Custom Subject: ${data.customField}`
)
```

## Security Features

The email system includes:

- Rate limiting to prevent abuse
- Secure headers to prevent spoofing
- DKIM support for email authentication
- Sanitized logging to protect user privacy

## Testing Emails

Use the admin email preview tool at `/admin/email-preview` to view and test all email templates.

## Migration Guide

If you're still using the legacy email system, please follow these steps to migrate:

1. Replace direct imports from `sendEmail.js` with the adapter layer:
   ```javascript
   // Old approach
   import { sendPasswordResetEmail } from '@/lib/email/sendEmail';
   
   // New approach
   import { sendPasswordResetEmail } from '@/lib/email/emailAdapter';
   ```

2. For new features, use the emailService directly:
   ```javascript
   import { emailService } from '@/lib/email/emailService';
   ```

3. For client components, use server actions:
   ```javascript
   import { sendQueuedEmail, EMAIL_TYPES } from '@/app/actions/email';
   ``` 