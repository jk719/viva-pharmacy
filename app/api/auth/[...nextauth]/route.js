import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { comparePasswords } from '@/lib/auth/password';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            console.log('No user found:', credentials.email);
            throw new Error('No user found with this email');
          }

          const isValid = await comparePasswords(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            throw new Error('Invalid password');
          }

          if (!user.isVerified) {
            console.log('User not verified:', credentials.email);
            throw new Error('Please verify your email before logging in');
          }

          // Return complete user object with all necessary fields
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            vivaBucks: user.vivaBucks || 0,
            rewardPoints: user.rewardPoints || 0,
            cumulativePoints: user.cumulativePoints || 0,
            currentTier: user.currentTier || 'Standard'
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error; // Changed from return null to throw error for better error handling
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (user) {
        return true;
      }
      return false;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (trigger === "update" && token) {
        // Fetch fresh user data when session is updated
        const updatedUser = await User.findById(token.id).select('-password');
        if (updatedUser) {
          token.vivaBucks = updatedUser.vivaBucks;
          token.rewardPoints = updatedUser.rewardPoints;
          token.cumulativePoints = updatedUser.cumulativePoints;
          token.currentTier = updatedUser.currentTier;
        }
      }
      
      if (user) {
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
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.vivaBucks = token.vivaBucks;
        session.user.rewardPoints = token.rewardPoints;
        session.user.cumulativePoints = token.cumulativePoints;
        session.user.currentTier = token.currentTier;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
