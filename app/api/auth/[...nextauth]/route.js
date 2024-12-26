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
            return null;
          }

          const isValid = await comparePasswords(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          if (!user.isVerified) {
            console.log('User not verified:', credentials.email);
            return null;
          }

          // Return user object with only necessary fields
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'user',
            isVerified: user.isVerified,
            vivaBucks: user.vivaBucks || 0,
            rewardPoints: user.rewardPoints || 0,
            cumulativePoints: user.cumulativePoints || 0,
            currentTier: user.currentTier || 'STANDARD'
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      return !!user;
    },
    async jwt({ token, user, trigger }) {
      if (trigger === "update" && token?.id) {
        try {
          await dbConnect();
          const updatedUser = await User.findById(token.id).select('-password');
          if (updatedUser) {
            token.vivaBucks = updatedUser.vivaBucks || 0;
            token.rewardPoints = updatedUser.rewardPoints || 0;
            token.cumulativePoints = updatedUser.cumulativePoints || 0;
            token.currentTier = updatedUser.currentTier || 'STANDARD';
          }
        } catch (error) {
          console.error('Error updating token:', error);
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
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
