import { useSession } from "next-auth/react";
import { FaGift } from "react-icons/fa";
import { BsCoin } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

export default function VivaBucksProgress() {
  const { data: session } = useSession();
  const [vivaBucks, setVivaBucks] = useState(0);
  const [previousVivaBucks, setPreviousVivaBucks] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGreenBar, setShowGreenBar] = useState(false);
  const searchParams = useSearchParams();
  const targetAmount = 100;

  useEffect(() => {
    const fetchVivaBucks = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/vivabucks/${session.user.id}`);
          const data = await response.json();
          
          if (searchParams.get('payment_intent')) {
            setPreviousVivaBucks(vivaBucks);
            setIsAnimating(true);
            setShowGreenBar(true);
            
            setTimeout(() => {
              setVivaBucks(data.vivaBucks || 0);
            }, 500);
            
            setTimeout(() => {
              setShowGreenBar(false);
            }, 2000);
            
            setTimeout(() => {
              setIsAnimating(false);
            }, 2500);
          } else {
            setVivaBucks(data.vivaBucks || 0);
            setPreviousVivaBucks(data.vivaBucks || 0);
          }
        } catch (error) {
          console.error('Error fetching VivaBucks:', error);
        }
      }
    };

    fetchVivaBucks();
  }, [session, searchParams]);

  if (!session) return null;

  const progress = (vivaBucks / targetAmount) * 100;
  const previousProgress = (previousVivaBucks / targetAmount) * 100;

  return (
    <div className="fixed w-full top-[180px] md:top-[64px] z-40 bg-white">
      <div className="mx-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-2 md:p-2.5 border border-blue-100">
        {/* Mobile View */}
        <div className="block md:hidden flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BsCoin className={`text-orange-500 text-lg ${isAnimating ? 'animate-bounce' : ''}`} />
              <span className={`font-medium text-gray-700 text-sm ${isAnimating ? 'animate-pulse' : ''}`}>
                {vivaBucks.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-600">
                {(targetAmount - vivaBucks).toFixed(2)} more for
              </span>
              <div className="flex items-center bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                <FaGift className="mr-1 text-sm text-primary-color" />
                <span className="font-medium text-primary-color text-sm">$5 off</span>
              </div>
            </div>
          </div>
          <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
            {/* Base progress bar (orange) */}
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              style={{ width: `${Math.min(previousProgress, 100)}%` }}
            />
            {/* Animated progress overlay (green) */}
            {showGreenBar && (
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full
                  transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(progress, 100)}%`,
                  opacity: 0.8,
                }}
              />
            )}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BsCoin className={`text-orange-500 text-xl ${isAnimating ? 'animate-bounce' : ''}`} />
              <span className={`font-medium text-gray-700 ${isAnimating ? 'animate-pulse' : ''}`}>
                {vivaBucks.toFixed(2)}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="relative w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              {/* Base progress bar (orange) */}
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                style={{ width: `${Math.min(previousProgress, 100)}%` }}
              />
              {/* Animated progress overlay (green) */}
              {showGreenBar && (
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full
                    transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min(progress, 100)}%`,
                    opacity: 0.8,
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {(targetAmount - vivaBucks).toFixed(2)} more for
            </span>
            <div className="flex items-center bg-white px-3 py-1 rounded-lg border border-blue-200">
              <FaGift className="mr-2 text-primary-color" />
              <span className="font-medium text-primary-color">$5 off</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 