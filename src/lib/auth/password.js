import bcrypt from 'bcryptjs';

export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      errors: {
        length: true,
        upperCase: true,
        lowerCase: true,
        number: true,
        specialChar: true
      },
      message: 'Password is required'
    };
  }

  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = {
    length: password.length < minLength,
    upperCase: !hasUpperCase,
    lowerCase: !hasLowerCase,
    number: !hasNumbers,
    specialChar: !hasSpecialChar
  };

  const isValid = !Object.values(errors).some(error => error);

  let message = '';
  if (!isValid) {
    const errorMessages = [];
    if (errors.length) errorMessages.push('be at least 8 characters long');
    if (errors.upperCase) errorMessages.push('include an uppercase letter');
    if (errors.lowerCase) errorMessages.push('include a lowercase letter');
    if (errors.number) errorMessages.push('include a number');
    if (errors.specialChar) errorMessages.push('include a special character');
    message = `Password must ${errorMessages.join(', ')}`;
  }

  return {
    isValid,
    errors,
    message
  };
};

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
};

export const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

// Helper function to check password strength
export const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  const checks = [
    password.length >= 8,            // Length
    /[A-Z]/.test(password),         // Uppercase
    /[a-z]/.test(password),         // Lowercase
    /\d/.test(password),            // Numbers
    /[!@#$%^&*(),.?":{}|<>]/.test(password)  // Special chars
  ];

  return (checks.filter(Boolean).length / checks.length) * 100;
};
