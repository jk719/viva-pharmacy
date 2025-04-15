export function isWithinDays(date1, date2, days) {
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}

export function calculateBirthdayReward(tier) {
  const rewards = {
    'None': 100,
    'Bronze': 200,
    'Silver': 300,
    'Gold': 500,
    'Platinum': 1000
  };
  return rewards[tier] || rewards['None'];
} 