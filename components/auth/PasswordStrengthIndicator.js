'use client';

import { useEffect, useState } from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState({
    score: 0,
    feedback: '',
    checks: {
      minLength: false,
      hasNumber: false,
      hasSpecial: false,
      hasUppercase: false,
      hasLowercase: false
    }
  });

  useEffect(() => {
    const checkPassword = (pass) => {
      const checks = {
        minLength: pass.length >= 8,
        hasNumber: /\d/.test(pass),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
        hasUppercase: /[A-Z]/.test(pass),
        hasLowercase: /[a-z]/.test(pass)
      };

      // Calculate score (0-4)
      const score = Object.values(checks).filter(Boolean).length;

      // Generate feedback
      let feedback = '';
      if (score === 0) feedback = 'Very weak';
      else if (score === 1) feedback = 'Weak';
      else if (score === 2) feedback = 'Fair';
      else if (score === 3) feedback = 'Good';
      else if (score === 4) feedback = 'Strong';
      else if (score === 5) feedback = 'Very strong';

      return { score, feedback, checks };
    };

    setStrength(checkPassword(password));
  }, [password]);

  const getColorClass = (isValid) => 
    isValid ? 'text-green-600' : 'text-gray-400';

  const getStrengthColor = () => {
    switch (strength.score) {
      case 0: return 'bg-gray-200';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-green-600';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 h-1.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 rounded-full transition-colors duration-200 ${
              i < strength.score ? getStrengthColor() : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {password && (
        <div className="text-sm space-y-2">
          <p className="font-medium text-gray-700">
            Password strength: <span className="font-semibold">{strength.feedback}</span>
          </p>
          
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <li className={`flex items-center gap-1 ${getColorClass(strength.checks.minLength)}`}>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                {strength.checks.minLength ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                )}
              </svg>
              At least 8 characters
            </li>
            <li className={`flex items-center gap-1 ${getColorClass(strength.checks.hasNumber)}`}>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                {strength.checks.hasNumber ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                )}
              </svg>
              Contains a number
            </li>
            <li className={`flex items-center gap-1 ${getColorClass(strength.checks.hasSpecial)}`}>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                {strength.checks.hasSpecial ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                )}
              </svg>
              Contains a special character
            </li>
            <li className={`flex items-center gap-1 ${getColorClass(strength.checks.hasUppercase)}`}>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                {strength.checks.hasUppercase ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                )}
              </svg>
              Contains an uppercase letter
            </li>
            <li className={`flex items-center gap-1 ${getColorClass(strength.checks.hasLowercase)}`}>
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                {strength.checks.hasLowercase ? (
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                ) : (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                )}
              </svg>
              Contains a lowercase letter
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
