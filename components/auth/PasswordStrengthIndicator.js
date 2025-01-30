'use client';
import { getPasswordStrength } from '@/lib/auth/password';

const PasswordStrengthIndicator = ({ password }) => {
  const strength = getPasswordStrength(password);
  
  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = () => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const strengthText = getStrengthText();
  const strengthColor = getStrengthColor();

  return (
    <div className="mt-2 space-y-2">
      {password && (
        <>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Password strength:</span>
            <span className={`font-medium ${
              strength <= 40 ? 'text-red-500' : 
              strength <= 60 ? 'text-yellow-500' : 
              'text-green-600'
            }`}>
              {strengthText}
            </span>
          </div>
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${strengthColor} transition-all duration-300 ease-in-out`}
              style={{ width: `${strength}%` }}
            />
          </div>
          <ul className="text-xs text-gray-500 space-y-1 mt-2">
            <li className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : ''}`}>
              {password.length >= 8 ? '✓' : '○'} At least 8 characters
            </li>
            <li className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : ''}`}>
              {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
            </li>
            <li className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : ''}`}>
              {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
            </li>
            <li className={`flex items-center gap-1 ${/\d/.test(password) ? 'text-green-600' : ''}`}>
              {/\d/.test(password) ? '✓' : '○'} One number
            </li>
            <li className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : ''}`}>
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} One special character
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
