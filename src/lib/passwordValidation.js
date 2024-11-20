// Password strength requirements
const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    maxLength: 128,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1
  };
  
  // Special characters allowed in password
  const SPECIAL_CHARS = '!@#$%^&*(),.?":{}|<>';
  
  export const validatePassword = (password) => {
    // Initialize requirements check
    const requirements = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      maxLength: password.length <= PASSWORD_REQUIREMENTS.maxLength,
      hasUpperCase: (password.match(/[A-Z]/g) || []).length >= PASSWORD_REQUIREMENTS.minUppercase,
      hasLowerCase: (password.match(/[a-z]/g) || []).length >= PASSWORD_REQUIREMENTS.minLowercase,
      hasNumber: (password.match(/[0-9]/g) || []).length >= PASSWORD_REQUIREMENTS.minNumbers,
      hasSpecialChar: (password.match(new RegExp(`[${SPECIAL_CHARS}]`, 'g')) || []).length >= PASSWORD_REQUIREMENTS.minSymbols
    };
  
    // Check if all requirements are met
    const passed = Object.values(requirements).every(Boolean);
  
    // Generate user-friendly messages
    const messages = {
      minLength: 'Must be at least 8 characters long',
      maxLength: 'Must not exceed 128 characters',
      hasUpperCase: 'Must contain at least one uppercase letter',
      hasLowerCase: 'Must contain at least one lowercase letter',
      hasNumber: 'Must contain at least one number',
      hasSpecialChar: `Must contain at least one special character (${SPECIAL_CHARS})`
    };
  
    // Get failed requirements messages
    const failedRequirements = Object.entries(requirements)
      .filter(([_, passed]) => !passed)
      .map(([req]) => messages[req]);
  
    return {
      passed,
      requirements,
      messages: failedRequirements,
      strengthScore: calculatePasswordStrength(password)
    };
  };
  
  // Calculate password strength score (0-100)
  const calculatePasswordStrength = (password) => {
    let score = 0;
  
    // Length contribution (up to 25 points)
    score += Math.min(25, (password.length / PASSWORD_REQUIREMENTS.minLength) * 25);
  
    // Character type contribution (25 points each)
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (new RegExp(`[${SPECIAL_CHARS}]`).test(password)) score += 25;
  
    // Bonus points for mixing character types
    const varietyBonus = (
      (/[A-Z]/.test(password) ? 1 : 0) +
      (/[a-z]/.test(password) ? 1 : 0) +
      (/[0-9]/.test(password) ? 1 : 0) +
      (new RegExp(`[${SPECIAL_CHARS}]`).test(password) ? 1 : 0)
    ) * 5;
  
    score = Math.min(100, score + varietyBonus);
  
    return score;
  };
  
  // Get password strength label
  export const getPasswordStrengthLabel = (score) => {
    if (score >= 90) return { label: 'Very Strong', color: 'green' };
    if (score >= 70) return { label: 'Strong', color: 'blue' };
    if (score >= 40) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Weak', color: 'red' };
  };
  
  // Password strength indicator component helper
  export const getStrengthIndicatorWidth = (score) => {
    return `${score}%`;
  };
  
  // Check for common passwords
  export const isCommonPassword = (password) => {
    const commonPasswords = [
      'password',
      '123456',
      'qwerty',
      'admin',
      // Add more common passwords as needed
    ];
    return commonPasswords.includes(password.toLowerCase());
  };
  
  // Export constants for use in components
  export const PASSWORD_RULES = {
    requirements: PASSWORD_REQUIREMENTS,
    specialChars: SPECIAL_CHARS
  };