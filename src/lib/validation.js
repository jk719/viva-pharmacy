"use client";

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return {
    isValid: phoneRegex.test(phoneNumber),
    message: phoneRegex.test(phoneNumber) ? '' : 'Invalid phone number format'
  };
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Invalid email format'
  };
};

export { validatePhoneNumber, validateEmail };