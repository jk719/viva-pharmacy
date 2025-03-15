import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./password";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) return null;
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin || false,
          role: user.role || 'USER'
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.role = user.role || (user.isAdmin ? 'ADMIN' : 'USER');
      }
      return token;
    },
    async session({ session, token }) {
      session.user.isAdmin = token.isAdmin;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
};

export * from './verification';
export * from './password';

// Auth-related constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email before signing in',
  TOKEN_EXPIRED: 'Verification token has expired',
  INVALID_TOKEN: 'Invalid verification token',
  EMAIL_IN_USE: 'Email already registered',
  WEAK_PASSWORD: 'Password does not meet requirements',
  SERVER_ERROR: 'An error occurred on the server',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

// Auth-related utility functions
export const isAuthenticated = (session) => {
  return !!session?.user;
};

export const isAdmin = (session) => {
  return session?.user?.role === USER_ROLES.ADMIN;
};

export const isVerified = (session) => {
  return session?.user?.isVerified === true;
};
