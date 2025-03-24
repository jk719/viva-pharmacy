'use client';

import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

const siteConfig = {
  title: 'Go Viva Nova',
  description: 'Your trusted online pharmacy for health and wellness products.',
  socialLinks: {
    instagram: 'https://www.instagram.com/govivanova',
    facebook: 'https://www.facebook.com/govivanova',
    tiktok: 'https://www.tiktok.com/@govivanova'
  }
};

export default function SiteFooterWrapper() {
  return (
    <footer className="w-full bg-primary text-white py-4 mt-auto border-t border-primary-light">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 px-2 md:px-6">
          <div className="flex-shrink-0">
            <div className="relative w-[140px] h-[40px] md:w-[180px] md:h-[50px]">
              <Image
                src="/images/govivanova-logo.png"
                alt="Go Viva Nova"
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 140px, 180px"
                priority
              />
            </div>
          </div>
          
          <div className="flex space-x-8 items-center">
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
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <Icon size={24} />
                </a>
              );
            })}
          </div>

          <div className="text-sm md:text-base text-gray-300">
            &copy; {new Date().getFullYear()} {siteConfig.title}
          </div>
        </div>
      </div>
    </footer>
  );
} 