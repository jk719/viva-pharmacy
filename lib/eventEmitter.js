import mitt from 'mitt';

const eventEmitter = mitt();

export const Events = {
  POINTS_UPDATED: 'pointsUpdated',
  POINTS_RESET: 'pointsReset'
};

export default eventEmitter;  