export function generateAdminWelcomeEmail({ email, tempPassword }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
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
            <p>Your admin account has been created for Viva Pharmacy's management system.</p>

            <div class="credentials">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>

            <p class="warning">Important: Please change your password after your first login for security purposes.</p>

            <p>To get started:</p>
            <ol>
              <li>Visit <a href="${baseUrl}/?showLogin=true">Viva Pharmacy Login</a></li>
              <li>Use your email and temporary password to sign in</li>
              <li>Change your password immediately</li>
            </ol>

            <p>If you have any questions or issues, please contact the system administrator.</p>
          </div>
        </div>
      </body>
    </html>
  `;
} 