"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import LoyaltyBanner from "@/components/loyalty/LoyaltyBanner";
import { LoyaltyProvider } from "@/components/loyalty/LoyaltyProvider";
import DebugPanel from "./debug-panel";
import { useRouter } from "next/navigation";
import useImprovedLoyaltyStore from "@/lib/loyalty/improvedLoyaltyStore";

export default function TestVivaBucksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [animateEarnedVivaBucks, setAnimateEarnedVivaBucks] = useState(0);
  const { userData, progressInfo, isLoading } = useImprovedLoyaltyStore();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/test-vivabucks");
    }
  }, [status, router]);

  // Handle animation completion
  const handleAnimationComplete = () => {
    console.log("Animation completed!");
    setAnimateEarnedVivaBucks(0);
  };

  // Handle testing animation
  const testAnimation = (amount) => {
    setAnimateEarnedVivaBucks(amount);
  };

  // Show loading state
  if (status === "loading" || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-spin mb-4">
          <svg className="w-12 h-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Show LoyaltyBanner at the top */}
      <LoyaltyBanner 
        animateEarnedVivaBucks={animateEarnedVivaBucks}
        onProgressBarAnimationComplete={handleAnimationComplete}
      />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">VivaBucks Loyalty System Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Panel */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => testAnimation(10)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                  Animate +10 VivaBucks
                </button>
                
                <button
                  onClick={() => testAnimation(50)}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  Animate +50 VivaBucks
                </button>
                
                <button
                  onClick={() => testAnimation(100)}
                  className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
                >
                  Animate +100 VivaBucks
                </button>
                
                <button
                  onClick={() => testAnimation(500)}
                  className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded"
                >
                  Animate +500 VivaBucks
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium mb-2">Current Progress</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Current VivaBucks:</div>
                  <div className="font-mono">{userData?.vivaBucks || 0}</div>
                  
                  <div>Current Tier:</div>
                  <div className="font-mono">{userData?.currentTier || 'Unknown'}</div>
                  
                  <div>Progress to Next Tier:</div>
                  <div className="font-mono">
                    {progressInfo ? `${progressInfo.progress.toFixed(2)}%` : 'Unknown'}
                  </div>
                  
                  <div>Threshold:</div>
                  <div className="font-mono">
                    {progressInfo ? 
                      `${progressInfo.currentThreshold} → ${progressInfo.nextThreshold}` : 
                      'Unknown'}
                  </div>
                </div>
              </div>
              
              <DebugPanel />
            </div>
          </div>
          
          {/* Sidebar Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
              <div className="prose prose-sm">
                <p>This page allows you to test various aspects of the VivaBucks loyalty system:</p>
                
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>
                    <strong>Animation Testing:</strong> Use the buttons to test different animation amounts
                  </li>
                  <li>
                    <strong>Debug Panel:</strong> Use the admin debug panel to test more advanced features
                  </li>
                  <li>
                    <strong>Data Updates:</strong> Observe how the UI updates after points are added
                  </li>
                  <li>
                    <strong>Optimistic Updates:</strong> See how the UI updates immediately before server confirmation
                  </li>
                </ul>
                
                <p className="mt-4 text-sm text-gray-500">
                  Note: Animation testing only simulates the visual effect and does not actually add points to your account.
                  To add real points, use the debug panel options.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">User Info</h2>
              <div className="text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>Name:</div>
                  <div>{session.user.name}</div>
                  
                  <div>Email:</div>
                  <div className="truncate">{session.user.email}</div>
                  
                  <div>Role:</div>
                  <div>{session.user.role || 'USER'}</div>
                  
                  <div>Session Expires:</div>
                  <div>{new Date(session.expires).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 