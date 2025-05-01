import { FaGift, FaUndo } from 'react-icons/fa';

export default function LoyaltyBenefitsSummary({
  loyaltyBenefits,
  userData,
  redemptionApplied,
  handleRedeemPoints,
  handleCancelRedemption,
  redemptionError
}) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 space-y-3">
      <h3 className="text-lg font-semibold text-blue-900">
        VivaBucks Rewards Summary
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Base Points</span>
          <span>{loyaltyBenefits.basePoints}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tier Multiplier ({loyaltyBenefits.tierMultiplier}x)</span>
          <span>+{(loyaltyBenefits.basePoints * loyaltyBenefits.tierMultiplier) - loyaltyBenefits.basePoints}</span>
        </div>
        {loyaltyBenefits.eventBenefits.bonusPoints > 0 && (
          <div className="flex justify-between text-sm">
            <span>Bonus Points</span>
            <span>+{loyaltyBenefits.eventBenefits.bonusPoints}</span>
          </div>
        )}
        {loyaltyBenefits.appliedEvents.map((event, index) => (
          <div key={index} className="text-sm text-blue-600">
            {event.name} applied: {event.multiplier}x multiplier
          </div>
        ))}
        <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
          <span>Total Points You'll Earn</span>
          <span>{loyaltyBenefits.totalPoints}</span>
        </div>
        <div className="border-t border-blue-200 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Available VivaBucks</span>
            <span>{userData.vivaBucks}</span>
          </div>
          {userData.vivaBucks >= 100 && !redemptionApplied ? (
            <button
              onClick={handleRedeemPoints}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors"
            >
              <FaGift className="text-lg" />
              Redeem 100 VivaBucks for $10 off
            </button>
          ) : redemptionApplied ? (
            <div className="mt-2">
              <div className="bg-green-100 text-green-800 p-2 rounded flex justify-between items-center">
                <span>100 VivaBucks redeemed for $10 discount</span>
                <button 
                  onClick={handleCancelRedemption}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaUndo className="text-lg" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-600">
              {userData.vivaBucks < 100 ? 
                `You need ${100 - userData.vivaBucks} more VivaBucks to redeem a $10 discount.` :
                'You can redeem VivaBucks for discounts.'
              }
            </div>
          )}
          {redemptionError && (
            <div className="mt-2 text-red-600 text-sm">{redemptionError}</div>
          )}
        </div>
      </div>
    </div>
  );
} 