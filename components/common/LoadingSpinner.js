'use client';

/**
 * Enhanced LoadingSpinner component with variants
 * Eliminates duplicate loading state patterns across the codebase
 */

const SPINNER_SIZES = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4', 
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
  '2xl': 'h-16 w-16'
};

const CONTAINER_HEIGHTS = {
  xs: 'min-h-[40px]',
  sm: 'min-h-[60px]',
  md: 'min-h-[100px]',
  lg: 'min-h-[200px]',
  xl: 'min-h-[300px]',
  full: 'min-h-screen'
};

const SPINNER_COLORS = {
  primary: 'border-primary',
  blue: 'border-blue-500',
  green: 'border-green-500',
  red: 'border-red-500',
  gray: 'border-gray-500',
  white: 'border-white'
};

const SPINNER_TYPES = {
  spinner: 'animate-spin rounded-full border-b-2',
  pulse: 'animate-pulse rounded-full bg-current',
  bounce: 'animate-bounce rounded-full bg-current',
  ping: 'animate-ping rounded-full bg-current'
};

function LoadingSpinner({
  size = 'lg',
  color = 'primary',
  type = 'spinner',
  containerHeight = 'lg',
  text = '',
  textPosition = 'bottom',
  className = '',
  containerClassName = '',
  center = true,
  inline = false
}) {
  const spinnerSizeClass = SPINNER_SIZES[size] || SPINNER_SIZES.lg;
  const containerHeightClass = CONTAINER_HEIGHTS[containerHeight] || CONTAINER_HEIGHTS.lg;
  const colorClass = SPINNER_COLORS[color] || SPINNER_COLORS.primary;
  const typeClass = SPINNER_TYPES[type] || SPINNER_TYPES.spinner;

  // For inline spinners, don't use container
  if (inline) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {text && textPosition === 'left' && (
          <span className="text-sm text-gray-600">{text}</span>
        )}
        <div className={`${typeClass} ${spinnerSizeClass} ${colorClass}`} />
        {text && textPosition === 'right' && (
          <span className="text-sm text-gray-600">{text}</span>
        )}
      </div>
    );
  }

  // Container classes
  const containerClasses = [
    center ? 'flex justify-center items-center' : 'flex',
    containerHeightClass,
    containerClassName
  ].filter(Boolean).join(' ');

  // Content wrapper for text positioning
  const ContentWrapper = ({ children }) => {
    if (!text) return children;

    const flexDirection = textPosition === 'top' || textPosition === 'bottom' 
      ? 'flex-col' 
      : 'flex-row';
    
    const gap = textPosition === 'left' || textPosition === 'right' 
      ? 'gap-3' 
      : 'gap-2';

    return (
      <div className={`flex ${flexDirection} items-center ${gap}`}>
        {(textPosition === 'top' || textPosition === 'left') && (
          <span className="text-sm text-gray-600 font-medium">{text}</span>
        )}
        {children}
        {(textPosition === 'bottom' || textPosition === 'right') && (
          <span className="text-sm text-gray-600 font-medium">{text}</span>
        )}
      </div>
    );
  };

  return (
    <div className={containerClasses}>
      <ContentWrapper>
        <div className={`${typeClass} ${spinnerSizeClass} ${colorClass} ${className}`} />
      </ContentWrapper>
    </div>
  );
}

/**
 * Specialized loading components for common use cases
 */

// Page loading spinner
function PageLoader({ text = 'Loading...', ...props }) {
  return (
    <LoadingSpinner
      size="xl"
      containerHeight="full"
      text={text}
      textPosition="bottom"
      {...props}
    />
  );
}

// Form loading spinner
function FormLoader({ text = 'Processing...', ...props }) {
  return (
    <LoadingSpinner
      size="md"
      containerHeight="md"
      text={text}
      textPosition="right"
      inline={true}
      {...props}
    />
  );
}

// Button loading spinner
function ButtonLoader({ text = '', ...props }) {
  return (
    <LoadingSpinner
      size="sm"
      text={text}
      textPosition="right"
      inline={true}
      color="white"
      {...props}
    />
  );
}

// Card/Section loading spinner
function SectionLoader({ text = 'Loading...', ...props }) {
  return (
    <LoadingSpinner
      size="lg"
      containerHeight="lg"
      text={text}
      textPosition="bottom"
      {...props}
    />
  );
}

// Inline text loading spinner
function InlineLoader({ text = 'Loading...', ...props }) {
  return (
    <LoadingSpinner
      size="xs"
      text={text}
      textPosition="right"
      inline={true}
      {...props}
    />
  );
}

// Table/List loading spinner
function TableLoader({ text = 'Loading data...', ...props }) {
  return (
    <LoadingSpinner
      size="md"
      containerHeight="md"
      text={text}
      textPosition="bottom"
      {...props}
    />
  );
}

// Overlay loading spinner (for modals, etc.)
function OverlayLoader({ text = 'Please wait...', ...props }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <LoadingSpinner
          size="xl"
          text={text}
          textPosition="bottom"
          containerHeight="sm"
          {...props}
        />
      </div>
    </div>
  );
}

// Export all variants for easy importing
export {
  LoadingSpinner,
  PageLoader,
  FormLoader,
  ButtonLoader,
  SectionLoader,
  InlineLoader,
  TableLoader,
  OverlayLoader
};

// Default export
export default LoadingSpinner; 