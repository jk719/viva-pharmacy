'use client';

import Image from "next/image";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

const siteConfig = {
  title: 'VIVA Pharmacy & Wellness',
  description: 'Your trusted online pharmacy for health and wellness products.',
  socialLinks: {
    instagram: 'https://www.instagram.com/vivapharmacy',
    facebook: 'https://www.facebook.com/vivapharmacy',
    tiktok: 'https://www.tiktok.com/@vivapharmacy'
  }
};

export default function SiteFooterWrapper() {
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