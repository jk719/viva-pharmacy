"use client";

import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      
      // Update the state initially
      setMatches(media.matches);
      
      // Set up listener for changes
      const listener = (e) => {
        setMatches(e.matches);
      };
      
      // Add the listener
      media.addEventListener("change", listener);
      
      // Clean up
      return () => {
        media.removeEventListener("change", listener);
      };
    }
    
    // Default to false on the server
    return () => {};
  }, [query]);
  
  return matches;
} 