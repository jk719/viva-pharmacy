"use client";

import { useEffect } from 'react';

export default function TestModal({ onClose }) {
  useEffect(() => {
    console.log('TestModal mounted');
    return () => console.log('TestModal unmounted');
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center" 
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Test Modal Works!</h2>
        <p className="mb-4">This is a simple test modal with no dependencies.</p>
        <button 
          className="w-full py-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
} 