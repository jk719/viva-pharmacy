export const STATES = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

export const TAX_RATES = {
  'AL': { state: 0.04 },
  'AK': { state: 0.00 }, // No state sales tax
  'AZ': { state: 0.056 },
  'AR': { state: 0.065 },
  'CA': { state: 0.0725 },
  'CO': { state: 0.029 },
  'CT': { state: 0.0635 },
  'DE': { state: 0.00 }, // No state sales tax
  'FL': { state: 0.06 },
  'GA': { state: 0.04 },
  'HI': { state: 0.04 },
  'ID': { state: 0.06 },
  'IL': { state: 0.0625 },
  'IN': { state: 0.07 },
  'IA': { state: 0.06 },
  'KS': { state: 0.065 },
  'KY': { state: 0.06 },
  'LA': { state: 0.0445 },
  'ME': { state: 0.055 },
  'MD': { state: 0.06 },
  'MA': { state: 0.0625 },
  'MI': { state: 0.06 },
  'MN': { state: 0.06875 },
  'MS': { state: 0.07 },
  'MO': { state: 0.04225 },
  'MT': { state: 0.00 }, // No state sales tax
  'NE': { state: 0.055 },
  'NV': { state: 0.0685 },
  'NH': { state: 0.00 }, // No state sales tax
  'NJ': { state: 0.06625 },
  'NM': { state: 0.05125 },
  'NY': {
    state: 0.04,
    regions: {
      'NYC': {
        total: 0.08875,
        breakdown: {
          city: 0.045,
          mta: 0.00375
        }
      },
      'Long Island': {
        total: 0.08625,
        breakdown: {
          county: 0.0425,
          mta: 0.00375
        }
      }
    }
  },
  'NC': { state: 0.0475 },
  'ND': { state: 0.05 },
  'OH': { state: 0.0575 },
  'OK': { state: 0.045 },
  'OR': { state: 0.00 }, // No state sales tax
  'PA': { 
    state: 0.06,
    regions: {
      'Philadelphia': {
        total: 0.08,
        breakdown: { city: 0.02 }
      }
    }
  },
  'RI': { state: 0.07 },
  'SC': { state: 0.06 },
  'SD': { state: 0.045 },
  'TN': { state: 0.07 },
  'TX': { state: 0.0625 },
  'UT': { state: 0.0485 },
  'VT': { state: 0.06 },
  'VA': { state: 0.053 },
  'WA': { state: 0.065 },
  'WV': { state: 0.06 },
  'WI': { state: 0.05 },
  'WY': { state: 0.04 },
  'DC': { state: 0.06 }
};

export function calculateTax(subtotal, state, region = null) {
  if (!TAX_RATES[state]) {
    console.warn(`No tax rate found for state: ${state}`);
    return 0;
  }

  const stateRate = TAX_RATES[state];
  
  if (region && stateRate.regions && stateRate.regions[region]) {
    return subtotal * stateRate.regions[region].total;
  }

  return subtotal * stateRate.state;
}

export function getTaxRate(state, region = null) {
  if (!TAX_RATES[state]) {
    return 0;
  }

  const stateRate = TAX_RATES[state];
  
  if (region && stateRate.regions && stateRate.regions[region]) {
    return stateRate.regions[region].total;
  }

  return stateRate.state;
}

export function formatTaxRate(rate) {
  return `${(rate * 100).toFixed(3)}%`;
}

export function hasRegions(state) {
  return TAX_RATES[state]?.regions !== undefined;
}

export function getRegions(state) {
  return TAX_RATES[state]?.regions ? Object.keys(TAX_RATES[state].regions) : [];
}
