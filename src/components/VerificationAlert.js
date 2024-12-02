'use client';
import { useSession } from 'next-auth/react';

export default function VerificationAlert() {
  const { data: session } = useSession();

  if (!session?.user || session.user.isVerified) {
    return null;
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
      <div className="flex flex-col items-center text-center">
        <span className="text-primary font-semibold">
          ⚠️ Please verify your email
        </span>
        <span className="text-sm text-gray-600 mt-1">
          Check your inbox for the verification link
        </span>
      </div>
    </div>
  );
} 