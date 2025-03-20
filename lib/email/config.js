import { createDKIMKey } from 'nodemailer/lib/dkim';

export const emailConfig = {
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  },
  defaults: {
    from: `"Viva Pharmacy" <${process.env.GMAIL_USER}>`
  },
  dkim: {
    domainName: "vivapharmacy.com",
    keySelector: "default",
    privateKey: process.env.DKIM_PRIVATE_KEY,
    cacheDir: "/tmp",
    cacheTreshold: 100 * 1024
  },
  spf: {
    enforce: true,
    policy: 'v=spf1 include:_spf.google.com ~all'
  }
}; 