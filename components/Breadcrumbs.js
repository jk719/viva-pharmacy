'use client';

import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex py-3 text-sm">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={item.url} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-500">{item.name}</span>
            ) : (
              <Link
                href={item.url}
                className="text-blue-600 hover:text-blue-800"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 