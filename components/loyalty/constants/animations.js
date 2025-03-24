export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  slideIn: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  pointsCounter: {
    initial: { scale: 1 },
    animate: { scale: 1.1 },
    exit: { scale: 1 },
    transition: { duration: 0.3 }
  },
  progressBar: {
    initial: { width: '0%' },
    animate: width => ({ width: `${width}%` }),
    transition: { duration: 1, ease: "easeOut" }
  }
};

export const BADGE_ANIMATIONS = {
  container: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, staggerChildren: 0.1 }
  },
  
  item: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
}; 