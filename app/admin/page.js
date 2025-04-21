"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductManagement from '@/components/admin/ProductManagement';
import { motion } from "framer-motion";
import { FiPackage, FiUsers, FiShoppingCart, FiSettings, FiMenu } from "react-icons/fi";
import { useState, useEffect } from "react";
import Image from 'next/image'
import ManagerManagement from '@/components/admin/ManagerManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import OrderStats from '@/components/admin/OrderStats';
import OrderAnalytics from '@/components/admin/OrderAnalytics';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Move the authorization check into useEffect
  useEffect(() => {
    if (status === "authenticated" && 
        (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role))) {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Remove the direct router.push() and return null
  if (status === "unauthenticated") {
    return null;
  }

  // Filter menu items based on role
  const menuItems = session.user.role === 'ADMIN' ? [
    { id: 'products', icon: FiPackage, label: 'Products' },
    { id: 'orders', icon: FiShoppingCart, label: 'Orders' },
    { id: 'users', icon: FiUsers, label: 'Users' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
  ] : [
    { id: 'products', icon: FiPackage, label: 'Products' }
  ];

  // If manager tries to access non-products tab, redirect to products
  useEffect(() => {
    if (session.user.role === 'MANAGER' && activeTab !== 'products') {
      setActiveTab('products');
    }
  }, [activeTab, session.user.role]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b sticky top-0 z-20"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-2xl font-bold text-gray-800">Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {session.user.name}
              </span>
              <Image 
                src={session.user.image || '/default-avatar.png'} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border-2 border-primary"
                width={32}
                height={32}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Always-visible, scrollable Menu Bar */}
      <div className="container mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex overflow-x-auto gap-2 md:gap-4 pb-2 mb-6 scrollbar-hide"
        >
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg
                whitespace-nowrap transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'}
              `}
              style={{ minWidth: 120 }}
            >
              <item.icon className="text-lg" />
              <span>{item.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-4 md:p-6"
        >
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6">Order Analytics</h2>
                <OrderAnalytics />
              </div>
              <OrderStats />
              <OrderManagement />
            </div>
          )}
          {activeTab === 'users' && session.user.role === 'ADMIN' && <ManagerManagement />}
          {activeTab === 'settings' && <div>Settings (Coming Soon)</div>}
        </motion.div>
      </div>
    </div>
  );
}
