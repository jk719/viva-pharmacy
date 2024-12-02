// src/pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import bcrypt from 'bcrypt';

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
          console.log("Authorize function called with credentials:", {
            email: credentials.email,
            passwordLength: credentials.password?.length
          });

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

          console.log("Found user:", {
            email: user.email,
            storedPasswordHash: user.password?.substring(0, 10) + '...',
          });

          // Direct bcrypt comparison
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          console.log("Password comparison result:", isValidPassword);
          
          if (!isValidPassword) {
            console.log("Invalid password for user:", credentials.email);
            throw new Error("Invalid email or password");
          }

          console.log("User authenticated successfully:", user.email);
          
          return { 
            id: user._id.toString(), 
            email: user.email,
            isVerified: user.isVerified,
            role: user.role || 'user'
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
    async jwt({ token, user, trigger, session }) {
      console.log('JWT Callback - Current token:', token);
      console.log('JWT Callback - User data:', user);
      console.log('JWT Callback - Trigger:', trigger);

      if (user) {
        // Initial sign in
        token.id = user.id;
        token.email = user.email;
        token.isVerified = user.isVerified;
        token.role = user.role;
      }

      // If it's a session update
      if (trigger === "update") {
        try {
          await dbConnect();
          const freshUser = await User.findOne({ email: token.email });
          
          if (freshUser) {
            console.log('JWT Callback - Fresh user data:', {
              email: freshUser.email,
              isVerified: freshUser.isVerified
            });
            
            token.isVerified = freshUser.isVerified;
            token.role = freshUser.role || 'user';
          }
        } catch (error) {
          console.error('Error updating JWT:', error);
        }
      }

      console.log('JWT Callback - Updated token:', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Token:', token);
      console.log('Session Callback - Initial session:', session);

      if (session?.user) {
        session.user.id = token.id;
        session.user.isVerified = token.isVerified;
        session.user.role = token.role;
      }

      console.log('Session Callback - Updated session:', session);
      return session;
    }
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('SignIn Event:', { user, isNewUser });
    },
    async session({ session, token }) {
      console.log('Session Event:', { session, token });
    },
    async updateUser({ user }) {
      console.log('UpdateUser Event:', user);
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
