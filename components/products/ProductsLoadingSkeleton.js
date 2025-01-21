"use client";

export default function ProductsLoadingSkeleton({ view = 'grid' }) {
  return view === 'grid' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="bg-white p-6 rounded-lg shadow animate-pulse"
        >
          <div className="h-48 bg-gray-200 rounded-lg mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-10 bg-gray-200 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-white p-4 rounded-lg shadow animate-pulse
                   flex gap-4"
        >
          <div className="h-32 w-32 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-10 bg-gray-200 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
} 