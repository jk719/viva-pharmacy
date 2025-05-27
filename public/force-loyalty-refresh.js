// Force Loyalty Data Refresh Script
// Copy and paste this entire script into your browser console

async function forceLoyaltyRefresh() {
  console.log('🔄 Starting comprehensive loyalty data refresh...');
  
  try {
    // Step 1: Clear all localStorage
    console.log('🗑️ Clearing localStorage...');
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('loyalty') || key.includes('vivabucks') || key.includes('viva-') || key.includes('next-auth'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`   Removed: ${key}`);
    });
    
    // Step 2: Clear sessionStorage
    console.log('🗑️ Clearing sessionStorage...');
    sessionStorage.clear();
    
    // Step 3: Force refresh API data with cache busting
    console.log('📡 Force fetching fresh data from API...');
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    try {
      const response = await fetch(`/api/user/profile?nocache=${timestamp}&r=${random}&_cb=${Date.now()}`, {
        method: 'GET',
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "If-None-Match": "*"
        },
        cache: "no-store"
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fresh API data received:', {
          vivaBucks: data.vivaBucks,
          cumulativeVivaBucks: data.cumulativeVivaBucks,
          currentTier: data.currentTier
        });
      } else {
        console.warn('⚠️ API response not OK:', response.status);
      }
    } catch (apiError) {
      console.warn('⚠️ API fetch failed:', apiError.message);
    }
    
    // Step 4: Clear any Zustand stores
    console.log('🗑️ Clearing Zustand stores...');
    if (window.useLoyaltyStore) {
      try {
        window.useLoyaltyStore.getState().reset();
        console.log('   Zustand store reset');
      } catch (e) {
        console.log('   No Zustand store found or error resetting');
      }
    }
    
    // Step 5: Reload the page
    console.log('🔄 Reloading page to apply changes...');
    console.log('✅ Cache clearing complete!');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error during refresh:', error);
    console.log('🔄 Reloading page anyway...');
    window.location.reload();
  }
}

// Auto-run the refresh
forceLoyaltyRefresh(); 