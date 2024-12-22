import mitt from 'mitt';

const eventEmitter = mitt();

export const Events = {
  POINTS_UPDATED: 'pointsUpdated',
  POINTS_RESET: 'pointsReset',
  REWARD_REDEEMED: 'rewardRedeemed',
  REWARD_RESTORED: 'rewardRestored',
  PAYMENT_SUCCESS: 'paymentSuccess'
};

export default eventEmitter;  