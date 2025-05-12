/**
 * Base email template with consistent styling for all Viva Pharmacy emails
 * This serves as the foundation for all email templates to ensure consistency
 */

// The brand colors and styles centralized here
const BRAND = {
  colors: {
    primary: '#FF9F43',
    secondary: '#003366',
    accent: '#0066cc',
    bgLight: '#FFFFFF',
    bgSecondary: '#f5f5f5',
    bgRewards: '#FFF5E6',
    bgBlueLight: '#E6F0FF',
    text: '#333333',
    textLight: '#666666',
    border: '#DDDDDD',
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545'
  },
  borderRadius: '8px',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
};

/**
 * Wrap content in the standard email template
 * @param {string} content - The main content of the email
 * @param {object} options - Options like title, preheader, etc.
 * @returns {string} Complete HTML email
 */
export function wrapInBaseTemplate(content, options = {}) {
  const { 
    title = 'Viva Pharmacy',
    preheader = '',
    showLogo = true,
    logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/images/viva-online-logo.png`,
    logoAlt = 'Viva Pharmacy'
  } = options;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>${title}</title>
        ${preheader ? `<meta name="preheader" content="${preheader}">` : ''}
        <style>
          /* Base styles */
          body {
            font-family: ${BRAND.fontFamily};
            line-height: 1.6;
            color: ${BRAND.colors.text};
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: ${BRAND.colors.bgLight};
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: ${BRAND.colors.primary};
            color: white;
            border-radius: ${BRAND.borderRadius} ${BRAND.borderRadius} 0 0;
            margin-bottom: 20px;
          }
          .content {
            background: ${BRAND.colors.bgLight};
            padding: 20px;
            border-radius: ${BRAND.borderRadius};
            border: 1px solid ${BRAND.colors.border};
          }
          .section {
            background-color: ${BRAND.colors.bgSecondary};
            padding: 15px;
            border-radius: ${BRAND.borderRadius};
            margin: 20px 0;
            border: 1px solid ${BRAND.colors.border};
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: ${BRAND.colors.primary};
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
            text-align: center;
          }
          .secondary-button {
            background-color: ${BRAND.colors.secondary};
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: ${BRAND.colors.textLight};
            font-size: 0.9em;
            background-color: ${BRAND.colors.bgSecondary};
            border-radius: 0 0 ${BRAND.borderRadius} ${BRAND.borderRadius};
            margin-top: 20px;
            border-top: 1px solid ${BRAND.colors.border};
          }
          .rewards-section {
            background-color: ${BRAND.colors.bgRewards};
            padding: 15px;
            border-radius: ${BRAND.borderRadius};
            margin: 20px 0;
            border: 1px solid ${BRAND.colors.border};
            text-align: center;
          }
          .logo {
            max-width: 200px;
            margin-bottom: 15px;
          }
          
          /* Outlook-specific overrides */
          [data-ogsc] .header { background-color: ${BRAND.colors.primary} !important; }
          [data-ogsc] .content { background-color: ${BRAND.colors.bgLight} !important; }
          [data-ogsc] .section { background-color: ${BRAND.colors.bgSecondary} !important; }
          [data-ogsc] .rewards-section { background-color: ${BRAND.colors.bgRewards} !important; }
          [data-ogsc] .button { background-color: ${BRAND.colors.primary} !important; }
          [data-ogsc] .secondary-button { background-color: ${BRAND.colors.secondary} !important; }
          
          /* Responsive styles */
          @media only screen and (max-width: 480px) {
            .container {
              padding: 10px;
            }
            .content {
              padding: 15px;
            }
            .section {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${showLogo ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="${logoAlt}" class="logo">
          </div>
          ` : ''}
          
          ${content}
          
          <div class="footer">
            <p>Thank you for choosing Viva Pharmacy!</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; ${new Date().getFullYear()} Viva Pharmacy. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Helper components for common email elements
export const EmailComponents = {
  header: (title, subtitle = '') => `
    <div class="header">
      <h1>${title}</h1>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>
  `,
  
  section: (content, className = '') => `
    <div class="section ${className}">
      ${content}
    </div>
  `,
  
  button: (text, url, isSecondary = false) => `
    <div style="text-align: center;">
      <a href="${url}" class="button ${isSecondary ? 'secondary-button' : ''}">
        ${text}
      </a>
    </div>
  `,
  
  rewardsSection: (content) => `
    <div class="rewards-section">
      ${content}
    </div>
  `,
  
  statusBadge: (text, isSuccess = true) => `
    <div style="text-align: center; margin-bottom: 15px;">
      <span style="
        display: inline-block;
        padding: 6px 12px;
        background-color: ${isSuccess ? BRAND.colors.success : BRAND.colors.warning};
        color: white;
        border-radius: 30px;
        font-weight: 500;
        font-size: 14px;
      ">
        ${text}
      </span>
    </div>
  `
};

export const BRAND_COLORS = BRAND.colors; 