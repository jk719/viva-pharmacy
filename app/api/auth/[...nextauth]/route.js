import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          await dbConnect();
          
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
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // Update token with session data
        return { ...token, ...session.user };
      }

      if (user) {
        // Initial sign in
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
