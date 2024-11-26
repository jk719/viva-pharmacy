import { Suspense } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';

// Server Component
export default async function ResetPasswordPage({ params }) {
  // Await the params
  const { token } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm token={token} />
    </Suspense>
  );
}