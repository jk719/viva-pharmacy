import { useSession } from "next-auth/react";
import { FaGift } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";

export default function VivaBucksProgress() {
  const { data: session } = useSession();
  const vivaBucks = 0;
  const targetAmount = 100;
  const progress = (vivaBucks / targetAmount) * 100;

  if (!session) return null;

  return (
    <div className="fixed w-full top-[180px] md:top-[64px] z-40 bg-white">
      <div className="mx-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-2 md:p-2.5 border border-blue-100">
        {/* Mobile View */}
        <div className="block md:hidden flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BsCoin className="text-yellow-500 text-lg" />
              <span className="font-medium text-gray-700 text-sm">{vivaBucks}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">{targetAmount - vivaBucks} more for</span>
              <div className="flex items-center bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                <FaGift className="mr-1 text-sm text-primary-color" />
                <span className="font-medium text-primary-color text-sm">$0 off</span>
              </div>
            </div>
          </div>
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BsCoin className="text-yellow-500 text-xl" />
              <span className="font-medium text-gray-700">{vivaBucks}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="relative w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{targetAmount - vivaBucks} more for</span>
            <div className="flex items-center bg-white px-3 py-1 rounded-lg border border-blue-200">
              <FaGift className="mr-2 text-primary-color" />
              <span className="font-medium text-primary-color">$0 off</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 