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
          {/* Prescription Banner placed directly above main content */}
          <div className="prescription-banner w-full bg-gradient-to-r from-primary/5 to-primary/10  border-y border-primary/10 relative overflow-hidden" style={{ opacity: 1, transform: 'none' }}>
            <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 opacity-10  transform rotate-45 translate-x-12 -translate-y-12 z-0">
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light"></div>
            </div>
            <div className="max-w-[1400px] mx-auto px-4 py-2 md:py-3">
              <div className="flex items-center justify-between gap-3 z-10 relative">
                <div className="flex items-center gap-3 md:gap-6">
                  <a className="flex items-center gap-2 text-[11px] md:text-base text-primary  hover:text-primary-light transition-colors" href="#">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" className="w-4 h-4 md:w-5 md:h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M301.26 352l78.06-78.06c6.25-6.25 6.25-16.38 0-22.63l-22.63-22.63c-6.25-6.25-16.38-6.25-22.63 0L256 306.74l-83.96-83.96C219.31 216.8 256 176.89 256 128c0-53.02-42.98-96-96-96H16C7.16 32 0 39.16 0 48v256c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-80h18.75l128 128-78.06 78.06c-6.25 6.25-6.25 16.38 0 22.63l22.63 22.63c6.25 6.25 16.38 6.25 22.63 0L256 397.25l78.06 78.06c6.25 6.25 16.38 6.25 22.63 0l22.63-22.63c6.25-6.25 6.25-16.38 0-22.63L301.26 352zM64 96h96c17.64 0 32 14.36 32 32s-14.36 32-32 32H64V96z"></path></svg>
                    <span className="font-medium whitespace-nowrap">Fill &amp; Refill</span>
                  </a>
                  <button className="flex items-center gap-2 text-[11px] md:text-base text-primary  hover:text-primary-light transition-colors" tabIndex={0}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="w-4 h-4 md:w-5 md:h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h16c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H416V144h44.1l99.9 99.9V256z"></path></svg>
                    <span className="font-medium whitespace-nowrap">Pay for Delivery</span>
                  </button>
                  <button className="flex items-center gap-2 text-[11px] md:text-base text-gray-500 hover:text-gray-600 transition-colors cursor-help" tabIndex={0}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-4 h-4 md:w-5 md:h-5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"></path></svg>
                    <span className="font-medium whitespace-nowrap">Track Order</span><span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">Soon</span>
                  </button>
                </div>
                <div className="hidden md:block">
                  <span className="text-sm text-primary-light">Need help? Call us at (718) 450-9595</span>
                </div>
              </div>
            </div>
          </div>
          <ClientLayout>
            <main className="md:min-h-screen w-full flex-grow pt-0 md:pt-0 pb-6">
              <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <Suspense fallback={<LoadingSpinner />}>
                  {children}
                </Suspense>
              </div>
            </main>
          </ClientLayout>
          <SiteFooterWrapper />
          <div id="modal-root" className="relative z-50" />
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
