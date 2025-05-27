// Clear loyalty cache script
// Run this in browser console to clear cached loyalty data

function clearLoyaltyCache() {
  try {
    // Clear localStorage
    localStorage.removeItem('viva-loyalty-storage');
    
    // Clear any other loyalty-related cache
    Object.keys(localStorage).forEach(key => {
      if (key.includes('loyalty') || key.includes('vivabucks')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Loyalty cache cleared!');
    console.log('🔄 Please refresh the page to see updated data.');
    
    // Auto refresh the page
    window.location.reload();
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
  }
}

// Auto-run if script is executed directly
clearLoyaltyCache(); 