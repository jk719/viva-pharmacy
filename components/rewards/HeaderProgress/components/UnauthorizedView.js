import Link from 'next/link';

const UnauthorizedView = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">
        Sign in to earn rewards
      </span>
      <Link 
        href="/login" 
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Login
      </Link>
    </div>
  );
};

export default UnauthorizedView;
