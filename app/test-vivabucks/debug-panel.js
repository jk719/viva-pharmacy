"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import useLoyaltyStore from '@/lib/loyalty/loyaltyStore';
import eventEmitter, { Events } from '@/lib/eventEmitter';

/**
 * Debug panel for administrators to test the loyalty system
 */
export default function LoyaltyDebugPanel() {
  const { data: session } = useSession();
  const { userData, progressInfo, pendingTransactions, fetchUserData } = useLoyaltyStore();
  
  const [amount, setAmount] = useState(100);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);

  // Load transaction history
  const loadTransactionHistory = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`/api/loyalty/transactions?userId=${session.user.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setTransactionHistory(data.transactions || []);
      setShowTransactions(true);
    } catch (err) {
      setError(`Error loading transactions: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add test VivaBucks directly via API
  const addTestVivaBucks = async () => {
    if (!session?.user?.id) return;
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setStatus('');
      
      const response = await fetch('/api/loyalty/add-vivabucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          vivaBucks: parseInt(amount),
          source: 'test',
          sourceId: `test_${Date.now()}`,
          metadata: {
            testTimestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add VivaBucks');
      }
      
      setStatus(`Successfully added ${amount} VivaBucks. New total: ${data.currentVivaBucks}`);
      
      // Refresh data
      fetchUserData();
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test optimistic updates
  const testOptimisticUpdate = () => {
    if (!session?.user?.id) return;
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    try {
      setError('');
      setStatus('');
      
      // Use the store's optimistic update function
      const txId = useLoyaltyStore.getState().addVivaBucksOptimistic(parseInt(amount));
      
      setStatus(`Optimistic update added ${amount} VivaBucks. Transaction ID: ${txId}`);
      
      // After a delay, simulate server confirmation
      setTimeout(() => {
        useLoyaltyStore.getState().confirmTransaction(txId, true);
        setStatus(prev => `${prev}\nTransaction confirmed successfully!`);
      }, 3000);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  // Simulate payment completion event
  const simulatePaymentEvent = () => {
    if (!session?.user?.id) return;
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    try {
      setError('');
      setStatus('');
      
      // Emit payment completed event
      eventEmitter.emit(Events.PAYMENT_COMPLETED, {
        userId: session.user.id,
        paymentIntentId: `sim_${Date.now()}`,
        amount: parseInt(amount) * 100, // In cents (for consistency with Stripe)
        vivaBucksEarned: parseInt(amount),
        timestamp: new Date().toISOString()
      });
      
      setStatus(`Simulated payment event that earned ${amount} VivaBucks`);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  // Force refresh loyalty data
  const forceRefresh = async () => {
    try {
      setIsLoading(true);
      setError('');
      setStatus('');
      
      await fetchUserData();
      
      setStatus('Loyalty data refreshed successfully');
    } catch (err) {
      setError(`Error refreshing data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is an admin
  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-500 mb-4">Admin Access Only</h2>
        <p>This debug panel is only available to administrators.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Loyalty System Debug Panel</h2>
      
      {/* Current User Data */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-medium mb-2">Current User Data</h3>
        <div className="text-sm grid grid-cols-2 gap-2">
          <div>User ID:</div>
          <div className="font-mono">{session?.user?.id || 'Not logged in'}</div>
          
          <div>VivaBucks:</div>
          <div className="font-mono">{userData?.vivaBucks || 0}</div>
          
          <div>Cumulative VivaBucks:</div>
          <div className="font-mono">{userData?.cumulativeVivaBucks || 0}</div>
          
          <div>Current Tier:</div>
          <div className="font-mono">{userData?.currentTier || 'Unknown'}</div>
          
          <div>Multiplier:</div>
          <div className="font-mono">{userData?.vivaBucksMultiplier || 1}x</div>
          
          <div>Progress to Next Tier:</div>
          <div className="font-mono">
            {progressInfo ? `${progressInfo.progress.toFixed(2)}%` : 'Unknown'}
          </div>
          
          <div>Pending Transactions:</div>
          <div className="font-mono">{pendingTransactions?.length || 0}</div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          VivaBucks Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 p-2 w-full border rounded-md"
            min="1"
          />
        </label>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={addTestVivaBucks}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add VivaBucks via API
          </button>
          
          <button
            onClick={testOptimisticUpdate}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Test Optimistic Update
          </button>
          
          <button
            onClick={simulatePaymentEvent}
            className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
          >
            Simulate Payment Event
          </button>
          
          <button
            onClick={forceRefresh}
            disabled={isLoading}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Force Refresh Data
          </button>
          
          <button
            onClick={loadTransactionHistory}
            disabled={isLoading}
            className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded"
          >
            {showTransactions ? 'Refresh Transactions' : 'Load Transaction History'}
          </button>
        </div>
      </div>
      
      {/* Status and Error Messages */}
      {status && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md whitespace-pre-line">
          {status}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      {/* Pending Transactions */}
      {pendingTransactions?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Pending Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left text-xs">ID</th>
                  <th className="py-2 px-3 text-left text-xs">Amount</th>
                  <th className="py-2 px-3 text-left text-xs">Type</th>
                  <th className="py-2 px-3 text-left text-xs">Status</th>
                  <th className="py-2 px-3 text-left text-xs">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map(tx => (
                  <tr key={tx.id} className="border-t">
                    <td className="py-2 px-3 text-xs font-mono">{tx.id.substr(0, 16)}...</td>
                    <td className="py-2 px-3 text-xs">{tx.amount}</td>
                    <td className="py-2 px-3 text-xs">{tx.type}</td>
                    <td className="py-2 px-3 text-xs">
                      <span className={`px-2 py-1 rounded text-xs ${
                        tx.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Transaction History */}
      {showTransactions && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Transaction History</h3>
          {transactionHistory.length === 0 ? (
            <p className="text-gray-500">No transactions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs">ID</th>
                    <th className="py-2 px-3 text-left text-xs">Amount</th>
                    <th className="py-2 px-3 text-left text-xs">Type</th>
                    <th className="py-2 px-3 text-left text-xs">Source</th>
                    <th className="py-2 px-3 text-left text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionHistory.map(tx => (
                    <tr key={tx._id} className="border-t">
                      <td className="py-2 px-3 text-xs font-mono">{tx._id.substr(0, 10)}...</td>
                      <td className="py-2 px-3 text-xs">{tx.amount}</td>
                      <td className="py-2 px-3 text-xs">{tx.type}</td>
                      <td className="py-2 px-3 text-xs">{tx.source}</td>
                      <td className="py-2 px-3 text-xs">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 