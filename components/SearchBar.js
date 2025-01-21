"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoSearchOutline } from 'react-icons/io5';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative w-full max-w-lg transition-all duration-200
                ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}
    >
      <input
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-4 py-3 rounded-full 
                 bg-white/10 backdrop-blur-sm 
                 text-white placeholder-white/70
                 border border-white/20 
                 focus:outline-none focus:ring-2
                 focus:ring-white/30 focus:border-transparent
                 transition-all duration-200"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2
                 text-white/70 hover:text-white 
                 transition-colors duration-200
                 focus:outline-none focus:text-white"
        aria-label="Search"
      >
        <IoSearchOutline 
          size={24} 
          className={`transition-transform duration-200
                    ${isFocused ? 'scale-110' : 'scale-100'}`}
        />
      </button>
    </form>
  );
} 