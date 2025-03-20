import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

// This component handles the precise vehicle animation
export default function DeliveryVehicle() {
  const controls = useAnimation();
  
  useEffect(() => {
    // Start the animation sequence
    const startAnimation = async () => {
      await controls.start({
        left: ['12%', '76%'], // Stop exactly at the edge of the home building
        opacity: 1,
        transition: {
          left: {
            duration: 3,
            ease: "easeInOut",
          },
          opacity: {
            duration: 0.5
          }
        }
      });
      
      // Pulse effect when reaching destination
      await controls.start({
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.5
        }
      });
      
      // Wait at destination
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset to starting position with opacity 0
      await controls.set({
        left: '12%',
        opacity: 0
      });
      
      // Start the sequence again
      startAnimation();
    };
    
    startAnimation();
    
    // Cleanup
    return () => controls.stop();
  }, [controls]);
  
  return (
    <motion.div
      // Use explicit pixel values to position the car
      style={{
        position: 'absolute',
        bottom: '8px',
        width: '44px', // Smaller on mobile
        height: '44px',
      }}
      initial={{ 
        left: '12%', // Start at pharmacy
        opacity: 0 
      }}
      animate={controls}
      className="sm:w-[56px] sm:h-[56px] sm:bottom-[12px]" // Larger on desktop
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="relative"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 bg-white text-primary rounded px-1 sm:px-1.5 py-0.5 text-[10px] sm:text-xs font-bold shadow-md"
        >
          28 min
        </motion.div>
        <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-lg">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
} 