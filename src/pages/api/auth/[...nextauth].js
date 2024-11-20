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
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        try {
          console.log("Authorize function called with credentials:", credentials);

          // Ensure credentials are present
          if (!credentials.identifier || !credentials.password) {
            throw new Error("Missing identifier or password");
          }

          await dbConnect(); // Connect to MongoDB
          console.log("Database connected");

          const user = await User.findOne({
            $or: [{ email: credentials.identifier }, { username: credentials.identifier }]
          });

          if (!user) {
            console.log("User not found for identifier:", credentials.identifier);
            throw new Error("No user found with provided identifier");
          }

          const isValidPassword = await user.comparePassword(credentials.password);
          console.log("Password match result for user:", isValidPassword);

          if (!isValidPassword) {
            throw new Error("Incorrect password");
          }

          return { 
            id: user._id, 
            email: user.email, 
            name: user.username,
            isVerified: user.isVerified
          };
        } catch (error) {
          console.error("Authorization error:", error);
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.isVerified = token.isVerified;

        try {
          await dbConnect();
          const currentUser = await User.findById(token.id);
          if (currentUser) {
            session.user.isVerified = currentUser.isVerified;
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
