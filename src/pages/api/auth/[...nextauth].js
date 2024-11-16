// src/pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        console.log("Authorize function called with credentials:", credentials);

        // Check for missing credentials
        if (!credentials.identifier || !credentials.password) {
          console.log("Missing identifier or password in credentials:", credentials);
          return null;
        }

        await dbConnect(); // Ensure database is connected
        console.log("Database connected");

        // Find the user by either email or username
        const user = await User.findOne({
          $or: [{ email: credentials.identifier }, { username: credentials.identifier }]
        });

        if (!user) {
          console.log("User not found with provided identifier:", credentials.identifier);
          return null;
        }

        // Verify password
        const isValidPassword = await user.comparePassword(credentials.password);
        console.log("Password match result for user:", isValidPassword);

        if (!isValidPassword) {
          console.log("Invalid password for user:", credentials.identifier);
          return null;
        }

        console.log("User authenticated successfully:", user.username);
        return { id: user._id, email: user.email, name: user.username };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback triggered with token:", token, "and user:", user);
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback triggered with session:", session, "and token:", token);
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true, // Enable debugging mode for NextAuth
});
