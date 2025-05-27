import React from 'react';

/**
 * Common Button component to consolidate duplicate styles
 * Supports various button variants and states
 */

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  // Base button styles
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white hover:opacity-90 focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    ghost: 'text-primary hover:bg-primary/10 focus:ring-primary'
  };
  
  // Size styles
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  // Disabled styles
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';
  
  // Loading styles
  const loadingStyles = 'cursor-wait';
  
  // Full width styles
  const fullWidthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = [
    baseStyles,
    variantStyles[variant] || variantStyles.primary,
    sizeStyles[size] || sizeStyles.medium,
    disabled && disabledStyles,
    loading && loadingStyles,
    fullWidthStyles,
    className
  ].filter(Boolean).join(' ');
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="animate-spin -ml-1 mr-3 h-5 w-5" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

// Export specific button variants for convenience
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const OutlineButton = (props) => <Button variant="outline" {...props} />;
export const DangerButton = (props) => <Button variant="danger" {...props} />;
export const SuccessButton = (props) => <Button variant="success" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />; 