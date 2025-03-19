'use client';

import { SWRConfig } from 'swr';

const swrConfig = {
  provider: () => new Map(),
  revalidateIfStale: true,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000, // Reduced to 30 seconds
  shouldRetryOnError: true,
  fetcher: async (resource, init) => {
    const res = await fetch(resource, init);
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