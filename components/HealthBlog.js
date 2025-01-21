"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const healthTips = [
  {
    id: 1,
    title: 'Understanding Medication Safety',
    excerpt: 'Learn about proper medication storage and usage guidelines.',
    image: 'https://placehold.co/600x400/png',
    link: '#'
  },
  {
    id: 2,
    title: 'Seasonal Health Guide',
    excerpt: 'Tips for staying healthy during changing seasons.',
    image: 'https://placehold.co/600x400/png',
    link: '#'
  },
  {
    id: 3,
    title: 'Wellness & Prevention',
    excerpt: 'Preventive healthcare measures for a healthier lifestyle.',
    image: 'https://placehold.co/600x400/png',
    link: '#'
  }
];

export default function HealthBlog() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Health Tips & Resources
        </h2>
        <p className="text-gray-600">
          Stay informed with our latest health articles and tips
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthTips.map((tip, index) => (
          <motion.article
            key={tip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              <Image
                src={tip.image}
                alt={tip.title}
                fill
                className="object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tip.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {tip.excerpt}
              </p>
              <Link
                href={tip.link}
                className="text-primary font-medium hover:text-primary/80 
                         transition-colors inline-flex items-center gap-1"
              >
                Read more
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
} 