'use client';

import { createContext, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';

const AnnouncementContext = createContext();

export function AnnouncementProvider({ children }) {
  const announce = useCallback((message, type = 'success') => {
    toast[type](message, {
      duration: 3000,
    });
  }, []);

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    console.warn('useAnnouncement must be used within an AnnouncementProvider');
    return { announce: () => {} }; // Fallback function
  }
  return context;
} 