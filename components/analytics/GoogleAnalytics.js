'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { GA_MEASUREMENT_ID } from '@/lib/analytics/gtag';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Debug logging
    console.log('🔍 GA Debug:', {
      component: 'GoogleAnalytics',
      measurementId: GA_MEASUREMENT_ID,
      pathname,
      searchParams: searchParams?.toString()
    });
    
    if (pathname) {
      if (typeof window !== 'undefined' && window.gtag) {
        console.log('📊 Sending pageview:', pathname);
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
          send_page_view: true,
          currency: 'USD',
          country: 'US'
        });
      } else {
        console.warn('⚠️ gtag not available');
      }
    }
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ No GA_MEASUREMENT_ID available');
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={() => {
          console.log('✅ GA Script loaded successfully');
          // Initialize debug mode
          window.gtag('config', GA_MEASUREMENT_ID, {
            debug_mode: true
          });
        }}
        onError={(e) => console.error('❌ GA Script failed to load:', e)}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){
              dataLayer.push(arguments);
              console.log('📊 GA Event:', arguments);
            }
            gtag('js', new Date());
            
            // Initialize with enhanced ecommerce
            gtag('config', '${GA_MEASUREMENT_ID}', {
              debug_mode: true,
              page_path: window.location.pathname,
              send_page_view: true,
              currency: 'USD',
              country: 'US'
            });

            // Enable enhanced ecommerce measurements
            gtag('set', 'developer_id', 'dZTNkMDk');
            gtag('set', {
              'custom_map': {
                'dimension1': 'product_category',
                'dimension2': 'product_brand',
                'dimension3': 'loyalty_tier',
                'metric1': 'loyalty_points'
              }
            });
            console.log('✅ GA initialization complete');
          `,
        }}
      />
    </>
  );
} 