// src/app/layout.js
// Keep this as a server component (no 'use client' directive)

import { Suspense } from "react";
import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { Providers } from './providers';
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ClientLayout from '@/components/ClientLayout';
import SiteHeader from '@/components/SiteHeader';
import SiteFooterWrapper from '@/components/SiteFooterWrapper';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';

// Metadata can be exported as a constant
const siteConfig = {
  title: 'Go Viva Nova',
  description: 'Your trusted online pharmacy for health and wellness products.',
  socialLinks: {
    instagram: 'https://www.instagram.com/govivanova',
    facebook: 'https://www.facebook.com/govivanova',
    tiktok: 'https://www.tiktok.com/@govivanova'
  }
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#002B49" />
        <link rel="icon" href="/favicon.ico" />
        {/* Remove source-map-support meta tag in production */}
        {process.env.NODE_ENV === 'development' && (
          <meta name="source-map-support" content="false" />
        )}
      </head>
      <body className="bg-white text-primary-color">
        <GoogleAnalytics />
        <Providers session={session}>
          <SiteHeader />
          <ClientLayout>
            <main className="md:min-h-screen w-full flex-grow main-content-with-banner">
              <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                <Suspense fallback={<LoadingSpinner />}>
                  {children}
                </Suspense>
              </div>
            </main>
          </ClientLayout>
          <SiteFooterWrapper />
          <div id="modal-root" style={{ position: 'relative', zIndex: 'var(--z-modals)' }} />
        </Providers>
      </body>
    </html>
  );
}

function SiteFooter() {
  return (
    <footer className="footer bg-primary text-white py-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0 px-4">
        <div className="flex items-center justify-center md:justify-start">
          <Image
            src="/images/viva-online-logo.png"
            alt={siteConfig.title}
            width={120}
            height={40}
            priority
            className="object-contain w-auto h-auto"
          />
        </div>
        <div className="flex space-x-6 items-center justify-center">
          {Object.entries(siteConfig.socialLinks).map(([platform, url]) => {
            const Icon = {
              instagram: FaInstagram,
              facebook: FaFacebook,
              tiktok: FaTiktok
            }[platform];
            
            return (
              <a 
                key={platform}
                href={url}
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={`Follow us on ${platform}`}
                className="hover:text-gray-300 transition-colors duration-200"
              >
                <Icon size={20} />
              </a>
            );
          })}
        </div>
        <div className="text-xs md:text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
