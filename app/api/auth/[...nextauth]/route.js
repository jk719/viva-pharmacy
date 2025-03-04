import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Export GET and POST handlers for API Route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
