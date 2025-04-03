import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if all required config is present
const hasRequiredConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.appId;

const app = hasRequiredConfig ? initializeApp(firebaseConfig) : null;
const storage = app ? getStorage(app) : null;

// Initialize Analytics with a promise-based approach
let analyticsPromise = null;

const initializeAnalytics = async () => {
  if (typeof window === 'undefined' || !app) return null;
  
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then(supported => {
      if (supported && app) {
        try {
          const analytics = getAnalytics(app);
          console.log('✅ Firebase Analytics initialized successfully');
          return analytics;
        } catch (error) {
          console.warn('⚠️ Firebase Analytics initialization failed, continuing without analytics');
          return null;
        }
      } else {
        console.warn('⚠️ Firebase Analytics is not supported in this environment');
        return null;
      }
    }).catch(error => {
      console.error('❌ Firebase Analytics initialization failed:', error);
      return null;
    });
  }
  
  return analyticsPromise;
};

export { storage, initializeAnalytics }; 