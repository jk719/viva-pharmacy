'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import MobileLayout from './components/MobileLayout';
import DesktopLayout from './components/DesktopLayout';
import UnauthorizedView from './components/UnauthorizedView';
import RedemptionModal from './components/RedemptionModal';
import SuccessModal from './components/SuccessModal';
import { useRewardsData } from './hooks/useRewardsData';
import { useRewardsAnimation } from './hooks/useRewardsAnimation';
import { useRewardsEvents } from './hooks/useRewardsEvents';

const HeaderProgress = () => {
  const { data: session } = useSession();
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState(0);

  const { rewardsData, setRewardsData, fetchRewardsData } = useRewardsData();
  const { scale, isAnimating, handleAnimation } = useRewardsAnimation(rewardsData, fetchRewardsData);
  useRewardsEvents(handleAnimation);

  if (!session) {
    return <UnauthorizedView />;
  }

  const handleRedemptionSuccess = (data) => {
    setRewardsData(data);
    setRedeemedAmount(data.redeemedAmount);
    setIsRedemptionModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <>
      <div className="w-full">
        <MobileLayout
          scale={scale}
          isAnimating={isAnimating}
          rewardsData={rewardsData}
        />
        <DesktopLayout
          scale={scale}
          isAnimating={isAnimating}
          rewardsData={rewardsData}
        />
      </div>

      <RedemptionModal
        isOpen={isRedemptionModalOpen}
        onClose={() => setIsRedemptionModalOpen(false)}
        rewardsData={rewardsData}
        onRedeem={handleRedemptionSuccess}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        amount={redeemedAmount}
      />
    </>
  );
};

export default HeaderProgress; 