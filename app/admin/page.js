"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProductManagement from '@/components/admin/ProductManagement';
import { motion } from "framer-motion";
import { FiPackage, FiUsers, FiShoppingCart, FiSettings, FiMenu } from "react-icons/fi";
import { useState } from "react";
import Image from 'next/image'
import ManagerManagement from '@/components/admin/ManagerManagement';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  if (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    router.push("/");
    return null;
  }

  const menuItems = [
    { id: 'products', icon: FiPackage, label: 'Products' },
    { id: 'orders', icon: FiShoppingCart, label: 'Orders' },
    { id: 'users', icon: FiUsers, label: 'Users' },
    { id: 'settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b sticky top-0 z-20"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiMenu className="w-6 h-6" />
              </button>
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed inset-0 z-10 bg-white md:hidden"
        >
          <div className="pt-20 px-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 w-full px-4 py-3 mb-2 rounded-lg
                  ${activeTab === item.id 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <item.icon className="text-xl" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Desktop Navigation */}
      <div className="container mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden md:flex overflow-x-auto gap-2 md:gap-4 pb-2 mb-6 
                     scrollbar-thin scrollbar-thumb-gray-300"
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
          {activeTab === 'orders' && <div>Orders Management (Coming Soon)</div>}
          {activeTab === 'users' && session.user.role === 'ADMIN' && <ManagerManagement />}
          {activeTab === 'settings' && <div>Settings (Coming Soon)</div>}
        </motion.div>
      </div>
    </div>
  );
}
