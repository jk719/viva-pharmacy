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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          throw new Error('Missing credentials');
        }

        try {
          await dbConnect();
          console.log('Attempting to find user:', credentials.email);
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            console.log('No user found:', credentials.email);
            return null;
          }

          console.log('User found, comparing password...');
          // Use the model's comparePassword method directly
          const isValid = await user.comparePassword(credentials.password);
          console.log('Password validation result:', isValid);
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          if (!user.isVerified) {
            console.log('User not verified:', credentials.email);
            throw new Error('Please verify your email before logging in');
          }

          console.log('Authentication successful for:', credentials.email);
          
          // Return user object with only necessary fields
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'USER', // Match the case with your schema
            isVerified: user.isVerified,
            vivaBucks: user.vivaBucks || 0,
            rewardPoints: user.rewardPoints || 0,
            cumulativePoints: user.cumulativePoints || 0,
            currentTier: user.currentTier || 'STANDARD'
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error; // Throw the error instead of returning null
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
