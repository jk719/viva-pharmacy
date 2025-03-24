"use client";

import { memo } from 'react';
import { IoAdd } from 'react-icons/io5';
import { HiMinusSm, HiPlusSm } from 'react-icons/hi';
import { motion } from 'framer-motion';

const QuantityControls = memo(({
  quantity = 0,
  onAdd,
  onRemove,
  isInStock = true,
  isLoading = false,
  variant = 'card', // 'card' or 'modal'
  size = 'default', // 'small', 'default', 'large'
  className = ''
}) => {
  // Determine if we should use motion components
  const ButtonComponent = variant === 'modal' ? motion.button : 'button';
  
  const sizeClasses = {
    small: {
      wrapper: 'p-0.5 sm:p-1',
      button: 'w-5 h-5 sm:w-6 sm:h-6 text-xs sm:text-sm',
      addButton: 'px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm',
      quantityText: 'w-6 sm:w-8 text-xs sm:text-sm'
    },
    default: {
      wrapper: 'p-1 sm:p-1.5',
      button: 'w-6 h-6 sm:w-8 sm:h-8 text-sm sm:text-base',
      addButton: 'py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm',
      quantityText: 'w-8 sm:w-10 text-base sm:text-lg'
    },
    large: {
      wrapper: 'p-1.5 sm:p-2',
      button: 'w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-lg',
      addButton: 'px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-lg',
      quantityText: 'w-10 sm:w-12 text-lg sm:text-xl'
    }
  }[size];

  const motionProps = variant === 'modal' ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <div className={className} onClick={e => e.stopPropagation()}>
      {quantity === 0 ? (
        <ButtonComponent
          onClick={onAdd}
          disabled={!isInStock || isLoading}
          className={`
            bg-primary text-white rounded-full 
            flex items-center justify-center gap-1 sm:gap-2 
            hover:opacity-90 shadow-md hover:shadow-lg 
            transition-all duration-300
            ${sizeClasses.addButton}
            ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}
            ${isLoading ? 'animate-pulse' : ''}
          `}
          {...motionProps}
        >
          <IoAdd className="text-base sm:text-lg" />
          <span className="font-medium whitespace-nowrap">
            {variant === 'card' ? 'Add' : 'Add to Cart'}
          </span>
        </ButtonComponent>
      ) : (
        <div className={`
          flex items-center justify-center gap-1 sm:gap-2 
          bg-gray-100 rounded-full shadow-inner
          ${sizeClasses.wrapper}
        `}>
          <ButtonComponent
            onClick={onRemove}
            className={`
              flex items-center justify-center 
              bg-white rounded-full text-red-500 
              hover:bg-red-50 shadow-sm hover:shadow-md 
              transition-all duration-300
              min-w-[20px] min-h-[20px]
              ${sizeClasses.button}
            `}
            {...motionProps}
          >
            <HiMinusSm />
          </ButtonComponent>
          <span className={`
            text-center font-medium
            ${sizeClasses.quantityText}
          `}>
            {quantity}
          </span>
          <ButtonComponent
            onClick={onAdd}
            className={`
              flex items-center justify-center 
              bg-white rounded-full text-green-500 
              hover:bg-green-50 shadow-sm hover:shadow-md 
              transition-all duration-300
              min-w-[20px] min-h-[20px]
              ${sizeClasses.button}
            `}
            {...motionProps}
          >
            <HiPlusSm />
          </ButtonComponent>
        </div>
      )}
    </div>
  );
});

QuantityControls.displayName = 'QuantityControls';

export default QuantityControls; 