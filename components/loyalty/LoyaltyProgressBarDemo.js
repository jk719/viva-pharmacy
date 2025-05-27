'use client';

import { useState } from 'react';
import LoyaltyProgressBar from './LoyaltyProgressBar';
import { useModal, ModalType } from '@/context/ModalContext';

export default function LoyaltyProgressBarDemo() {
  const [scenario, setScenario] = useState('small');
  const { showModal } = useModal();
  
  const scenarios = {
    small: {
      currentPoints: 150,
      earnedPoints: 10,
      startPoints: 0,
      endPoints: 500,
      label: 'Bronze to Silver Progress'
    },
    medium: {
      currentPoints: 750,
      earnedPoints: 50,
      startPoints: 500,
      endPoints: 1000,
      label: 'Silver to Gold Progress'
    },
    large: {
      currentPoints: 1800,
      earnedPoints: 200,
      startPoints: 1500,
      endPoints: 2500,
      label: 'Gold to Platinum Progress'
    },
    nearTier: {
      currentPoints: 495,
      earnedPoints: 25,
      startPoints: 0,
      endPoints: 500,
      label: 'Almost at Silver!'
    }
  };
  
  const current = scenarios[scenario];
  
  const testModal = () => {
    showModal(ModalType.LOYALTY_ANIMATION, {
      loyaltyPointsEarned: current.earnedPoints,
      pointsEarned: current.earnedPoints,
      orderId: 'test-' + Date.now(),
      total: 99.99,
      amount: 99.99
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        🎯 Loyalty Progress Bar Demo
      </h1>
      
      {/* Scenario Selector */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(scenarios).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`p-3 rounded-lg border-2 transition-all ${
                scenario === key 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium capitalize">{key}</div>
              <div className="text-sm text-gray-500">+{config.earnedPoints} pts</div>
            </button>
          ))}
        </div>
        
        <button
          onClick={testModal}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          🎭 Test Full Modal Animation
        </button>
      </div>
      
      {/* Current Scenario Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          Current Scenario: {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Current Points:</span>
            <div className="text-lg font-bold">{current.currentPoints.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-green-600 font-medium">Earned Points:</span>
            <div className="text-lg font-bold text-green-700">+{current.earnedPoints}</div>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Tier Range:</span>
            <div className="text-lg font-bold">{current.startPoints} - {current.endPoints}</div>
          </div>
          <div>
            <span className="text-purple-600 font-medium">Progress:</span>
            <div className="text-lg font-bold">
              {Math.round(((current.currentPoints - current.startPoints) / (current.endPoints - current.startPoints)) * 100)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar Variants */}
      <div className="space-y-8">
        {/* Standard Variant */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Standard Variant</h3>
          <LoyaltyProgressBar
            key={`standard-${scenario}-${Date.now()}`}
            currentPoints={current.currentPoints}
            earnedPoints={current.earnedPoints}
            startPoints={current.startPoints}
            endPoints={current.endPoints}
            animate={true}
            forceAnimation={true}
            label={current.label}
            variant="standard"
            onAnimationComplete={() => console.log('Standard animation complete!')}
          />
        </div>
        
        {/* Compact Variant */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Compact Variant</h3>
          <LoyaltyProgressBar
            key={`compact-${scenario}-${Date.now()}`}
            currentPoints={current.currentPoints}
            earnedPoints={current.earnedPoints}
            startPoints={current.startPoints}
            endPoints={current.endPoints}
            animate={true}
            forceAnimation={true}
            variant="compact"
            onAnimationComplete={() => console.log('Compact animation complete!')}
          />
        </div>
        
        {/* Modal Variant */}
        <div className="bg-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Modal Variant Preview</h3>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <LoyaltyProgressBar
              key={`modal-${scenario}-${Date.now()}`}
              currentPoints={current.currentPoints}
              earnedPoints={current.earnedPoints}
              startPoints={current.startPoints}
              endPoints={current.endPoints}
              animate={true}
              forceAnimation={true}
              label={current.label}
              variant="modal"
              onAnimationComplete={() => console.log('Modal animation complete!')}
            />
          </div>
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-auto">
          {JSON.stringify(current, null, 2)}
        </pre>
      </div>
    </div>
  );
} 