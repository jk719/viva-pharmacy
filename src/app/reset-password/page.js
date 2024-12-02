import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
  redirect('/forgot-password?error=Invalid reset password link');
}