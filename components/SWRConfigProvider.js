'use client';

import { SWRConfig } from 'swr';

const swrConfig = {
  provider: () => new Map(),
  revalidateIfStale: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 0,
  shouldRetryOnError: true,
  fetcher: async (resource, init) => {
    const res = await fetch(resource, {
      ...init,
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }
    return res.json();
  }
};

export default function SWRConfigProvider({ children }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
} 