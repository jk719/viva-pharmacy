import { createDKIMKey } from 'nodemailer/lib/dkim';

export const emailConfig = {
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