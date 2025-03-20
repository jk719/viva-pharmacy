import { FaSpinner } from 'react-icons/fa';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading prescription service...</p>
      </div>
    </div>
  );
} 