// src/components/Navbar.js
"use client";

import Image from "next/image";
import Link from "next/link";
import ClientCartIcon from "./ClientCartIcon";
import { AuthButtons } from "./auth";
import VerificationAlert from "./VerificationAlert";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FiSettings } from 'react-icons/fi';
import { toast } from "react-hot-toast";
import { FaPrescription, FaTruck, FaCreditCard } from 'react-icons/fa';
import PrescriptionDeliveryModal from './PrescriptionDeliveryModal';

const AdminDashboardButton = ({ isMobile = false }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Link 
      href="/admin"
      className={`flex items-center gap-1  
                 bg-[#4CAF50] rounded-lg hover:bg-[#45a049] 
                 transition-all duration-300 shadow-md
                 ${isMobile ? 'px-2 py-1.5 text-xs' : 'px-4 py-2'}`}
    >
      <FiSettings className={`text-white ${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
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
  const [mounted, setMounted] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Memoize session check
  const isAdmin = useMemo(() => {
    return mounted && session?.user?.role && 
      ['ADMIN', 'MANAGER'].includes(session.user.role);
  }, [mounted, session?.user?.role]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle verification only once
  useEffect(() => {
    if (!mounted) return;

    const verification = searchParams?.get('verification');
    const email = searchParams?.get('email');
    
    if (verification === 'success' && email && !session) {
      const handleVerification = async () => {
        try {
          await signIn('credentials', {
            redirect: false,
            email: email.toLowerCase().trim(),
            verificationLogin: 'true'
          });
        } catch (err) {
          console.error('Auto-login error:', err);
          setShowLogin(true);
        }
      };

      handleVerification();
    }
  }, [mounted, searchParams, session]);

  return (
    <>
      <motion.nav 
        className="viva-navbar w-full shadow-sm bg-black"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex lg:hidden flex-col w-full px-2">
            <div className="flex items-center justify-between py-2">
              <Link href="/" className="flex-shrink-0">
                <div className="relative w-[160px] h-[45px]">
                  <Image
                    src="/images/govivanova-logo.png"
                    alt="Go Viva Nova"
                    fill
                    className="object-contain object-left"
                    sizes="160px"
                    priority
                  />
                </div>
              </Link>
              
              <div className="flex items-center gap-3">
                {isAdmin && <AdminDashboardButton isMobile />}
                <Link href="/cart" className="relative flex items-center">
                  <ClientCartIcon />
                </Link>
                <div className="w-[100px]">
                  <AuthButtons
                    showLogin={showLogin}
                    setShowLogin={setShowLogin}
                    isMobile={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-between py-3 px-6">
            <Link href="/" className="flex-shrink-0">
              <div className="relative w-[320px] h-[90px]">
                <Image
                  src="/images/govivanova-logo.png"
                  alt="Go Viva Nova"
                  fill
                  className="object-contain object-left"
                  sizes="320px"
                  priority
                />
              </div>
            </Link>

            <div className="flex items-center gap-6">
              {isAdmin && <AdminDashboardButton />}
              <Link href="/cart" className="relative flex items-center">
                <ClientCartIcon />
              </Link>
              <AuthButtons
                showLogin={showLogin}
                setShowLogin={setShowLogin}
                isMobile={false}
              />
            </div>
          </div>
        </div>
      </motion.nav>
      {mounted && <VerificationAlert />}
    </>
  );
}
