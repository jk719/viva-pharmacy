'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      router.replace('/');
      return;
    }

    const verification = searchParams.get('verification');
    
    if (verification === 'success') {
      router.replace('/?showLogin=true&verification=success');
    } else {
      router.replace('/?showLogin=true');
    }
  }, [router, searchParams, status]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );
} 