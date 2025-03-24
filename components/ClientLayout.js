'use client';

import { Suspense } from 'react';
import SiteHeader from './SiteHeader';
import HeaderHeightAdjuster from './HeaderHeightAdjuster';
import LoadingSpinner from './common/LoadingSpinner';

export default function ClientLayout({ children }) {
  return (
    <>
      <Suspense fallback={<LoadingSpinner />}>
        <SiteHeader />
        <HeaderHeightAdjuster />
      </Suspense>
      {children}
    </>
  );
} 