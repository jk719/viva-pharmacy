"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import EditProductForm from "@/components/products/EditProductForm";

export default function EditProductClient({ productId }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || 
        (status === "authenticated" && 
         (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)))) {
      router.push("/");
    }
  }, [status, session, router]);

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle unauthorized access
  if (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <EditProductForm productId={productId} />
    </div>
  );
} 