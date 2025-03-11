import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { REWARD_CONSTANTS } from '@/lib/rewards/constants';

const RedemptionModal = ({ isOpen, onClose, rewardsData, onRedeem }) => {
  const { data: session } = useSession();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const availableReward = Math.floor(rewardsData.rewardPoints / REWARD_CONSTANTS.REWARD_RATE.POINTS_PER_DOLLAR);

  const handleRedeem = async () => {
    if (!amount || isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount) })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to redeem rewards');
      }

      onRedeem(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Redeem Rewards</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Available to redeem: ${availableReward}
              </p>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to redeem"
              className="w-full p-2 border rounded mb-4"
              max={availableReward}
              min={1}
            />
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={isLoading || !amount || amount > availableReward}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RedemptionModal; 