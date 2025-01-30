export function generatePasswordResetEmail({ email, name, resetToken, isManagerReset = false }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #003366;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #003366;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isManagerReset ? 'Set Your Password' : 'Reset Your Password'}</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>${isManagerReset 
              ? 'You need to set up your password for your Viva Pharmacy manager account.' 
              : 'We received a request to reset your password for your Viva Pharmacy account.'}</p>
            <p>Please click the button below to ${isManagerReset ? 'set' : 'reset'} your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">
                ${isManagerReset ? 'Set Password' : 'Reset Password'}
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p>${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            ${isManagerReset 
              ? '<p><strong>Note:</strong> You must set your password to access the management portal.</p>' 
              : '<p>If you did not request this reset, please ignore this email.</p>'}
          </div>
          <div class="footer">
            <p>This is an automated message from Viva Pharmacy. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 