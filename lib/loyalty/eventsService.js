export const EVENT_TYPES = {
  BIRTHDAY: 'BIRTHDAY',
  HOLIDAY: 'HOLIDAY',
  PROMOTION: 'PROMOTION',
  FLASH_SALE: 'FLASH_SALE',
  MILESTONE: 'MILESTONE'
};

export const calculateBirthdayReward = (tier) => {
  const rewards = {
    'None': 500,
    'Silver': 1000,
    'Gold': 1500,
    'Platinum': 2000,
    'Sapphire': 2500,
    'Diamond': 3000,
    'Legend': 3500
  };
  return rewards[tier] || rewards['None'];
};

export const isWithinDays = (date1, date2, days) => {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
};

export const formatEventDates = (startDate, endDate) => {
  return {
    start: new Date(startDate).toISOString(),
    end: new Date(endDate).toISOString()
  };
}; 