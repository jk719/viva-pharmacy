/**
 * Centralized style constants
 * Matches Tailwind's default values for consistency
 */

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Spacing scale (matching Tailwind)
export const SPACING = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384
};

// Common heights
export const HEIGHTS = {
  header: 64,
  loyaltyBanner: 48,
  footer: 200,
  modal: {
    small: 400,
    medium: 600,
    large: 800
  },
  carousel: {
    mobile: 420,
    desktop: 500
  }
};

// Z-index scale - Updated with comprehensive hierarchy
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  header: 100,
  notification: 110,
  // Additional specific values
  loyaltyBanner: 90,
  prescriptionBanner: 90,
  navbar: 100,
  progressAnimation: 95,
  floatingWidget: 45,
  overlay: 1000
};

// Animation durations (matching TIMING constants)
export const ANIMATION = {
  fast: '150ms',
  base: '300ms',
  slow: '500ms',
  slower: '1000ms'
};

// Border radius
export const RADIUS = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999
};

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000'
};

// Common aspect ratios
export const ASPECT_RATIOS = {
  square: '1 / 1',
  video: '16 / 9',
  photo: '4 / 3',
  portrait: '3 / 4'
};

// Media query helpers
export const media = {
  sm: `@media (min-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `@media (min-width: ${BREAKPOINTS['2xl']}px)`
};

// CSS variable helpers
export const cssVar = (name) => `var(--${name})`;
export const spacing = (value) => `${SPACING[value]}px`;
export const radius = (value) => `${RADIUS[value]}px`; 