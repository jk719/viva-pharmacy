import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Auth error constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  // ... add other error constants
};

// Helper functions
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (email, token) => {
  // ... your email sending logic
};

export const validatePassword = (password) => {
  return password.length >= 8;
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
        verificationLogin: { label: "Verification Login", type: "boolean" }
      },
      async authorize(credentials, req) {
        try {
          await dbConnect();
          
          console.log('Auth attempt:', {
            email: credentials.email,
            isVerificationLogin: credentials.verificationLogin === 'true'
          });
          
          if (credentials.verificationLogin === 'true') {
            console.log('Attempting verification auto-login');
            const user = await User.findOne({ 
              email: credentials.email.toLowerCase(),
              isVerified: true 
            });
            
            console.log('Verification login user found:', !!user);
            
            if (user) {
              console.log('Auto-login successful for:', user.email);
              return {
                id: user._id.toString(),
                email: user.email,
                role: user.role || 'USER',
                isVerified: true,
                vivaBucks: user.vivaBucks || 0,
                rewardPoints: user.rewardPoints || 0,
                cumulativePoints: user.cumulativePoints || 0,
                currentTier: user.currentTier || 'STANDARD'
              };
            }
            console.log('Verification auto-login failed: User not found or not verified');
            throw new Error('Verification auto-login failed');
          }

          // Normal login flow
          console.log('Normal login attempt');
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please enter both email and password');
          }

          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await user.comparePassword(credentials.password);
          
          if (!isValid) {
            throw new Error('Invalid password');
          }

          if (!user.isVerified) {
            throw new Error('Please verify your email before logging in');
          }

          console.log('Normal login successful for:', user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'USER',
            isVerified: user.isVerified,
            vivaBucks: user.vivaBucks || 0,
            rewardPoints: user.rewardPoints || 0,
            cumulativePoints: user.cumulativePoints || 0,
            currentTier: user.currentTier || 'STANDARD'
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
      if (trigger === "update" && session) {
        console.log('Updating JWT with session data');
        return { ...token, ...session.user };
      }

      if (user) {
        console.log('Creating new JWT for user:', user.email);
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.vivaBucks = user.vivaBucks;
        token.rewardPoints = user.rewardPoints;
        token.cumulativePoints = user.cumulativePoints;
        token.currentTier = user.currentTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log('Creating session for user:', token.email);
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          isVerified: token.isVerified,
          vivaBucks: token.vivaBucks,
          rewardPoints: token.rewardPoints,
          cumulativePoints: token.cumulativePoints,
          currentTier: token.currentTier
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/?showLogin=true',
    error: '/?showLogin=true',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signOut({ token }) {
      console.log('User signed out:', token?.email);
    }
  },
}; 