// src/app/layout.js

import { EventEmitter } from 'events';
import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import HeaderProgress from '@/components/HeaderProgress';
import RewardAlert from '@/components/RewardAlert';
import { headers } from 'next/headers';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { SWRConfig } from 'swr';

// Add this line before the siteConfig
EventEmitter.defaultMaxListeners = 50;

// Metadata can be exported as a constant
const siteConfig = {
  title: 'VIVA Pharmacy & Wellness',
  description: 'Your trusted online pharmacy for health and wellness products.',
  socialLinks: {
    instagram: 'https://www.instagram.com/vivapharmacy',
    facebook: 'https://www.facebook.com/vivapharmacy',
    tiktok: 'https://www.tiktok.com/@vivapharmacy'
  }
};

export default async function RootLayout({ children }) {
  console.log('RootLayout: Rendering');
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#FF9F43" />
        <link rel="icon" href="/favicon.ico" />
        {/* Remove source-map-support meta tag in production */}
        {process.env.NODE_ENV === 'development' && (
          <meta name="source-map-support" content="false" />
        )}
      </head>
      <body className="bg-white text-primary-color">
        <Providers session={session}>
          <header className="fixed top-0 left-0 right-0 w-full bg-white z-50">
            <Navbar />
            
            <div className="bg-white border-b">
              <HeaderProgress />
            </div>
          </header>

          <div className="h-[200px] sm:h-[200px]" aria-hidden="true" />

          <main className="min-h-screen w-full">
            <div className="container mx-auto px-4">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" 
                       role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              }>
                {children}
              </Suspense>
            </div>
          </main>

          <RewardAlert />
          
          <footer className="footer bg-primary text-white py-6 mt-auto">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-4 md:space-y-0 px-4">
              <div className="flex items-center justify-center md:justify-start">
                <Image
                  src="/images/viva-online-logo.png"
                  alt={siteConfig.title}
                  width={120}
                  height={40}
                  priority
                  className="object-contain"
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

          <div id="modal-root" className="relative z-50" />
          {/* <Toaster 
            position="top-right"
            containerStyle={{
              top: '400px',
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '16px',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              },
              success: {
                duration: 5000,
                icon: '✅',
                style: {
                  background: '#10B981',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#10B981',
                }
              },
              error: {
                duration: 6000,
                icon: '❌',
                style: {
                  background: '#EF4444',
                },
                iconTheme: {
                  primary: '#FFFFFF',
                  secondary: '#EF4444',
                }
              }
            }}
          /> */}
        </Providers>
      </body>
    </html>
  );
}
