export function generateAdminWelcomeEmail({ email, tempPassword, verificationToken }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  // Encode the token to handle special characters
  const encodedToken = encodeURIComponent(verificationToken);
  const verificationUrl = `${baseUrl}/verify-email?token=${encodedToken}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Viva Pharmacy Admin</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #003366;
            color: white;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .credentials {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .warning {
            color: #d63031;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #003366;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            text-align: center;
          }
          .steps {
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .step {
            margin-bottom: 10px;
          }
          .step-number {
            background: #003366;
            color: white;
            padding: 2px 8px;
            border-radius: 50%;
            margin-right: 8px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Viva Pharmacy Admin</h1>
          </div>

          <div class="content">
            <p>Hello,</p>
            <p>You have been invited to join Viva Pharmacy's management system as a Manager.</p>

            <div class="credentials">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>

            <div class="steps">
              <p><strong>Please follow these steps to get started:</strong></p>
              <p class="step">
                <span class="step-number">1</span>
                Click the verification button below to verify your email
              </p>
              <p class="step">
                <span class="step-number">2</span>
                After verification, you'll be redirected to set your permanent password
              </p>
              <p class="step">
                <span class="step-number">3</span>
                Use your email and new password to access the management portal
              </p>
            </div>

            <div style="text-align: center;">
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #003366; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Verify Email &amp; Set Password
              </a>
            </div>

            <p class="warning">
              Important: This verification link and temporary password will expire in 24 hours.
              Please complete the verification process as soon as possible.
            </p>

            <p>If you have any questions or issues, please contact the system administrator.</p>

            <p style="margin-top: 30px;">
              Best regards,<br>
              Viva Pharmacy Team
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
} 