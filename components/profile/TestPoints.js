'use client';

import { useState } from 'react';

export default function TestPoints() {
  const [points, setPoints] = useState(100);
  const [loading, setLoading] = useState(false);

  const addTestPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/vivabucks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: Number(points) }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Points added:', data);
        window.location.reload(); // Refresh to see changes
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Test Points</h3>
      <div className="flex gap-2">
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="px-3 py-2 border rounded-md w-24"
        />
        <button
          onClick={addTestPoints}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Points'}
        </button>
      </div>
    </div>
  );
} 