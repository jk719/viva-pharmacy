import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export const useRewardsData = () => {
  const { data: session } = useSession();
  const [rewardsData, setRewardsData] = useState({
    vivaBucks: 0,
    currentTier: 'STANDARD',
    cumulativeVivaBucks: 0,
    availableVivaBucks: 0,
    rewardPoints: 0,
    cumulativePoints: 0
  });

  const fetchRewardsData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/user/vivabucks/${session.user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRewardsData(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('[HeaderProgress] Error fetching rewards data:', error);
    }
  }, [session?.user?.id]);

  return { rewardsData, setRewardsData, fetchRewardsData };
}; 