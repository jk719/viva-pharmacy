"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditProductForm from "@/components/products/EditProductForm";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import EditHistoryModal from "@/components/admin/EditHistoryModal";
import RecentEditsPanel from "@/components/admin/RecentEditsPanel";

export default function EditProductClient({ productId }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditHistory, setShowEditHistory] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" || 
        (status === "authenticated" && 
         (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)))) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        if (data.success) {
          // Transform legacy category data if needed
          const transformedProduct = {
            ...data.product,
            categorySlug: data.product.categorySlug || data.product.category,
            subcategorySlug: data.product.subcategorySlug,
            itemSlug: data.product.itemSlug
          };
          setProduct(transformedProduct);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white shadow-sm border-b sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-primary
                         transition-colors duration-200"
              >
                <FiArrowLeft className="text-lg" />
                <span>Back</span>
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
            </div>
            {/* Mobile Recent Edits Button */}
            <button
              onClick={() => setShowEditHistory(true)}
              className="md:hidden px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-600"
            >
              Recent Edits
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Product Edit Form Area */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-6">
            <div className="container mx-auto max-w-4xl">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {product ? (
                  <EditProductForm product={product} />
                ) : (
                  <p className="text-center text-gray-600">Product not found</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Edits Panel - Hidden on mobile */}
        <div className="hidden md:block">
          <RecentEditsPanel />
        </div>
      </div>

      {/* Edit History Modal - For recent edits on mobile */}
      <EditHistoryModal
        isOpen={showEditHistory}
        onClose={() => setShowEditHistory(false)}
        productId={productId}
      />
    </div>
  );
} 