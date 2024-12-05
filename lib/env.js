export const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://viva-pharmacy.vercel.app';
  }
  return 'https://localhost:3000';
}; 