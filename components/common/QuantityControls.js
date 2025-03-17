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
      wrapper: 'p-1',
      button: 'w-6 h-6 text-sm',
      addButton: 'px-3 py-1.5 text-sm',
      quantityText: 'w-8 text-sm'
    },
    default: {
      wrapper: 'p-1 md:p-1.5',
      button: 'w-8 h-8 text-base',
      addButton: 'py-2 md:py-2.5 px-4 md:px-6 text-sm md:text-base',
      quantityText: 'w-10 text-lg'
    },
    large: {
      wrapper: 'p-2',
      button: 'w-10 h-10 text-lg',
      addButton: 'px-6 py-3 text-lg',
      quantityText: 'w-12 text-xl'
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
            flex items-center justify-center gap-2 
            hover:opacity-90 shadow-lg hover:shadow-xl 
            transition-all duration-300
            ${sizeClasses.addButton}
            ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}
            ${isLoading ? 'animate-pulse' : ''}
          `}
          {...motionProps}
        >
          <IoAdd className="text-lg md:text-xl" />
          <span className="font-medium">{variant === 'card' ? 'Add' : 'Add to Cart'}</span>
        </ButtonComponent>
      ) : (
        <div className={`
          flex items-center justify-center gap-2 md:gap-3 
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