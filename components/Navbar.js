// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import { AuthButtons } from "./auth";
import VerificationAlert from "./VerificationAlert";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FiSettings } from 'react-icons/fi';
import { toast } from "react-hot-toast";

const AdminDashboardButton = ({ isMobile = false }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link 
      href="/admin"
      className={`flex items-center gap-2 
                 bg-[#4CAF50] rounded-lg hover:bg-[#45a049] 
                 transition-all duration-300 shadow-md
                 ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
    >
      <FiSettings className={`text-white ${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
      <span className="font-medium text-white">
        {isMobile ? 'Admin' : 'Admin Dashboard'}
      </span>
    </Link>
  </motion.div>
);

const DefaultAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
    <svg 
      className="w-6 h-6 text-gray-400" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const verification = searchParams?.get('verification');
    const message = searchParams?.get('message');
    const email = searchParams?.get('email');
    
    if (message) {
      toast.success(decodeURIComponent(message));
    }
    
    if (verification === 'success' && email) {
      setShowLogin(true);
      setFormData(prev => ({ ...prev, email }));
    }
  }, [searchParams]);

  const renderMobileLayout = () => (
    <div className="flex flex-col md:hidden space-y-2">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/viva-online-logo.png"
            alt="VIVA Logo"
            width={120}
            height={36}
            className="h-8 w-auto"
            style={{ 
              height: "32px",
              width: "auto"
            }}
            priority
          />
        </Link>
        
        <div className="flex items-center gap-2">
          {session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role) && (
            <AdminDashboardButton isMobile />
          )}
          <AuthButtons
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            formData={formData}
            setFormData={setFormData}
            error={error}
            setError={setError}
            className="flex items-center text-sm scale-90"
          />
          <Link href="/cart" className="flex items-center justify-center scale-90">
            <ClientCartIcon />
          </Link>
        </div>
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="hidden md:flex md:items-center md:justify-between">
      <Link href="/">
        <Image
          src="/images/viva-online-logo.png"
          alt="VIVA Pharmacy & Wellness Logo"
          width={160}
          height={48}
          className="h-12 w-auto"
          style={{ 
            height: "48px",
            width: "auto"
          }}
          priority
        />
      </Link>

      <div className="flex items-center space-x-6">
        {session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role) && (
          <AdminDashboardButton />
        )}
        <Link href="/cart" className="text-white hover:text-white/80 transition-colors duration-300">
          <ClientCartIcon />
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2">
              {session.user.image && !avatarError ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User profile'}
                    fill
                    className="object-cover"
                    onError={() => setAvatarError(true)}
                    priority
                  />
                </div>
              ) : (
                <DefaultAvatar />
              )}
              <span className="text-white hover:text-white/80 transition-colors duration-300">
                {session.user.name}
              </span>
            </Link>
            <AuthButtons
              showLogin={showLogin}
              setShowLogin={setShowLogin}
              formData={formData}
              setFormData={setFormData}
              error={error}
              setError={setError}
            />
          </div>
        ) : (
          <AuthButtons
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            formData={formData}
            setFormData={setFormData}
            error={error}
            setError={setError}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <motion.nav 
        className="viva-navbar py-2 md:py-3 w-full shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-3 md:px-4">
          {renderMobileLayout()}
          {renderDesktopLayout()}
        </div>
      </motion.nav>
      <VerificationAlert />
    </>
  );
}
