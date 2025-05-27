/**
 * Enhanced address validation utilities
 * Eliminates duplicate address handling patterns across the codebase
 */

export const validateAddress = (address) => {
  const errors = {};

  if (!address.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!address.street?.trim()) {
    errors.street = 'Street address is required';
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!address.state?.trim()) {
    errors.state = 'State is required';
  }

  if (!address.zipCode?.trim()) {
    errors.zipCode = 'ZIP code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    errors.zipCode = 'Invalid ZIP code format';
  }

  if (!address.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\+?[\d\s-]{10,}$/.test(address.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generate a unique key for address comparison
 * @param {Object} address - Address object
 * @returns {string} Unique address key
 */
export const generateAddressKey = (address) => {
  if (!address) return '';
  
  const {
    street = '',
    apartment = '',
    city = '',
    state = '',
    zipCode = ''
  } = address;

  return `${street}-${apartment}-${city}-${state}-${zipCode}`.toLowerCase().trim();
};

/**
 * Check if two addresses are duplicates
 * @param {Object} address1 - First address
 * @param {Object} address2 - Second address
 * @returns {boolean} Whether addresses are duplicates
 */
export const areAddressesDuplicate = (address1, address2) => {
  if (!address1 || !address2) return false;
  
  const key1 = generateAddressKey(address1);
  const key2 = generateAddressKey(address2);
  
  return key1 === key2 && key1 !== '';
};

/**
 * Find duplicate addresses in an array
 * @param {Array} addresses - Array of addresses
 * @returns {Object} Duplicate analysis result
 */
export const findDuplicateAddresses = (addresses) => {
  if (!Array.isArray(addresses)) {
    return { duplicates: [], unique: [], duplicateKeys: new Set() };
  }

  const addressMap = new Map();
  const duplicates = [];
  const duplicateKeys = new Set();

  addresses.forEach((address, index) => {
    const key = generateAddressKey(address);
    
    if (key === '') return; // Skip invalid addresses
    
    if (addressMap.has(key)) {
      // Mark both original and current as duplicates
      const originalIndex = addressMap.get(key);
      duplicates.push({ 
        original: { address: addresses[originalIndex], index: originalIndex },
        duplicate: { address, index },
        key 
      });
      duplicateKeys.add(key);
    } else {
      addressMap.set(key, index);
    }
  });

  const unique = addresses.filter((address, index) => {
    const key = generateAddressKey(address);
    return !duplicateKeys.has(key) || addressMap.get(key) === index;
  });

  return {
    duplicates,
    unique,
    duplicateKeys,
    hasDuplicates: duplicates.length > 0
  };
};

/**
 * Remove duplicate addresses from an array
 * @param {Array} addresses - Array of addresses
 * @param {Object} options - Deduplication options
 * @returns {Array} Deduplicated addresses
 */
export const deduplicateAddresses = (addresses, options = {}) => {
  const {
    keepFirst = true, // Keep first occurrence vs last
    preserveDefault = true // Ensure one default address remains
  } = options;

  if (!Array.isArray(addresses)) return [];

  const addressMap = new Map();
  const result = [];

  addresses.forEach((address, index) => {
    const key = generateAddressKey(address);
    
    if (key === '') {
      // Keep invalid addresses as-is (they'll be handled by validation)
      result.push(address);
      return;
    }

    const existing = addressMap.get(key);
    
    if (!existing) {
      // First occurrence of this address
      addressMap.set(key, { address, index });
      result.push(address);
    } else if (!keepFirst) {
      // Replace with later occurrence
      const existingIndex = result.findIndex(addr => 
        generateAddressKey(addr) === key
      );
      if (existingIndex !== -1) {
        result[existingIndex] = address;
      }
    }
    // If keepFirst is true, ignore duplicates
  });

  // Ensure one default address if preserveDefault is true
  if (preserveDefault && result.length > 0) {
    const hasDefault = result.some(addr => addr.isDefault);
    if (!hasDefault) {
      result[0].isDefault = true;
    }
  }

  return result;
};

/**
 * Normalize address data for consistent comparison
 * @param {Object} address - Address object
 * @returns {Object} Normalized address
 */
export const normalizeAddress = (address) => {
  if (!address) return null;

  return {
    fullName: address.fullName?.trim() || '',
    street: address.street?.trim() || '',
    apartment: address.apartment?.trim() || '',
    city: address.city?.trim() || '',
    state: address.state?.trim().toUpperCase() || '',
    zipCode: address.zipCode?.trim().replace(/\D/g, '') || '', // Remove non-digits
    phone: address.phone?.trim() || '',
    isDefault: Boolean(address.isDefault),
    createdAt: address.createdAt || new Date()
  };
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted address string
 */
export const formatAddressDisplay = (address, options = {}) => {
  const {
    includePhone = false,
    includeName = true,
    multiLine = false,
    separator = multiLine ? '\n' : ', '
  } = options;

  if (!address) return '';

  const parts = [];

  if (includeName && address.fullName) {
    parts.push(address.fullName);
  }

  if (address.street) {
    let streetLine = address.street;
    if (address.apartment) {
      streetLine += ` ${address.apartment}`;
    }
    parts.push(streetLine);
  }

  if (address.city && address.state && address.zipCode) {
    parts.push(`${address.city}, ${address.state} ${address.zipCode}`);
  }

  if (includePhone && address.phone) {
    parts.push(address.phone);
  }

  return parts.join(separator);
};

/**
 * Check if address is complete (has all required fields)
 * @param {Object} address - Address object
 * @returns {boolean} Whether address is complete
 */
export const isAddressComplete = (address) => {
  if (!address) return false;

  const required = ['fullName', 'street', 'city', 'state', 'zipCode', 'phone'];
  return required.every(field => address[field]?.trim());
};

/**
 * Get address validation schema for API validation
 * @returns {Object} Validation schema
 */
export const getAddressValidationSchema = () => ({
  fullName: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  street: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 200
  },
  apartment: {
    required: false,
    type: 'string',
    maxLength: 50
  },
  city: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  state: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 2,
    pattern: /^[A-Z]{2}$/,
    patternMessage: 'State must be a 2-letter code'
  },
  zipCode: {
    required: true,
    type: 'string',
    pattern: /^\d{5}(-\d{4})?$/,
    patternMessage: 'ZIP code must be in format 12345 or 12345-6789'
  },
  phone: {
    required: true,
    type: 'string',
    pattern: /^\+?[\d\s-()]{10,}$/,
    patternMessage: 'Phone number format is invalid'
  }
});

/**
 * Clean up user addresses (remove duplicates, ensure default)
 * @param {Array} addresses - User's addresses
 * @returns {Object} Cleanup result
 */
export const cleanupUserAddresses = (addresses) => {
  if (!Array.isArray(addresses)) {
    return { addresses: [], changes: [] };
  }

  const changes = [];
  const originalCount = addresses.length;

  // Normalize all addresses
  const normalized = addresses.map(addr => normalizeAddress(addr));

  // Remove duplicates
  const deduplicated = deduplicateAddresses(normalized, {
    keepFirst: true,
    preserveDefault: true
  });

  // Track changes
  if (deduplicated.length !== originalCount) {
    changes.push(`Removed ${originalCount - deduplicated.length} duplicate addresses`);
  }

  // Ensure only one default address
  const defaultAddresses = deduplicated.filter(addr => addr.isDefault);
  if (defaultAddresses.length > 1) {
    // Keep first default, remove default flag from others
    deduplicated.forEach((addr, index) => {
      if (addr.isDefault && index > 0) {
        addr.isDefault = false;
      }
    });
    changes.push(`Fixed multiple default addresses`);
  } else if (defaultAddresses.length === 0 && deduplicated.length > 0) {
    // Set first address as default
    deduplicated[0].isDefault = true;
    changes.push(`Set first address as default`);
  }

  return {
    addresses: deduplicated,
    changes,
    removedCount: originalCount - deduplicated.length
  };
};

export default {
  validateAddress,
  generateAddressKey,
  areAddressesDuplicate,
  findDuplicateAddresses,
  deduplicateAddresses,
  normalizeAddress,
  formatAddressDisplay,
  isAddressComplete,
  getAddressValidationSchema,
  cleanupUserAddresses
}; 