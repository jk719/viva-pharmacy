import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email/sendEmail';

// Auth error constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'No user found with this email',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'An unexpected error occurred'
};

// Helper functions
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  return {
    isValid: password.length >= minLength && hasNumber && hasSpecial && hasUppercase && hasLowercase,
    checks: {
      minLength: password.length >= minLength,
      hasNumber,
      hasSpecial,
      hasUppercase,
      hasLowercase
    }
  };
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// Main auth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        verificationLogin: { label: "Verification Login", type: "boolean" },
        verificationToken: { label: "Verification Token", type: "text" }
      },
      async authorize(credentials, req) {
        try {
          await dbConnect();
          
          // Handle verification auto-login
          if (credentials.verificationLogin === 'true') {
            const user = await User.findOne({ 
              email: credentials.email.toLowerCase(),
              isVerified: true
            }).select('+password');
            
            if (!user) {
              throw new Error(AUTH_ERRORS.USER_NOT_FOUND);
            }

            return {
              id: user._id.toString(),
              email: user.email,
              role: user.role,
              isVerified: true,
              mustChangePassword: user.mustChangePassword
            };
          }

          // Normal login flow
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            throw new Error('Please enter both email and password');
          }

          console.log('Attempting login for:', credentials.email);
          
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');
          
          if (!user) {
            console.log('User not found');
            throw new Error(AUTH_ERRORS.USER_NOT_FOUND);
          }

          console.log('Found user:', {
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password?.length,
            isVerified: user.isVerified,
            role: user.role
          });

          // Log password details (be careful with sensitive data)
          console.log('Password comparison:', {
            credentialsPasswordLength: credentials.password?.length,
            storedPasswordLength: user.password?.length,
            isPasswordHashed: user.password?.startsWith('$2')
          });

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log('Password comparison result:', isValid);
          
          if (!isValid) {
            console.log('Password invalid');
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
          }

          if (!user.isVerified) {
            console.log('User not verified');
            throw new Error(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
          }

          console.log('Login successful');
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'USER',
            isVerified: user.isVerified,
            name: user.name,
            mustChangePassword: user.mustChangePassword
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.name = user.name;
        token.mustChangePassword = user.mustChangePassword;
      }

      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          isVerified: token.isVerified,
          name: token.name,
          mustChangePassword: token.mustChangePassword ?? false
        };
      }
      return session;
    }
  },
  pages: {
    // signIn: '/login',
    // error: '/login',
    verifyRequest: '/verify-email',
    newUser: '/register'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 