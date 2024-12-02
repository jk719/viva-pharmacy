import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { comparePasswords, AUTH_ERRORS } from '@/lib/auth';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email.toLowerCase() });

          if (!user) {
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
          }

          const isValid = await comparePasswords(credentials.password, user.password);
          if (!isValid) {
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
          }

          return {
            id: user._id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          };
        } catch (error) {
          throw new Error(error.message || AUTH_ERRORS.SERVER_ERROR);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        const updatedUser = await User.findOne({ email: token.email });
        if (updatedUser) {
          token.isVerified = updatedUser.isVerified;
          token.role = updatedUser.role;
        }
      }
      if (user) {
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
