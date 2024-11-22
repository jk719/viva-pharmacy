// src/pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
          console.log("Authorize function called with credentials:", credentials);

          if (!credentials.email || !credentials.password) {
            throw new Error("Email and password are required");
          }

          await dbConnect();
          console.log("Database connected");

          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          if (!user) {
            console.log("User not found for email:", credentials.email);
            throw new Error("Invalid email or password");
          }

          const isValidPassword = await user.comparePassword(credentials.password);
          
          if (!isValidPassword) {
            console.log("Invalid password for user:", credentials.email);
            throw new Error("Invalid email or password");
          }

          console.log("User authenticated successfully:", user.email);
          
          return { 
            id: user._id, 
            email: user.email,
            isVerified: user.isVerified
          };
        } catch (error) {
          console.error("Authorization error:", error);
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.isVerified = token.isVerified;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
    verifyRequest: '/verify-email',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
