import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LoyaltyProgram from "@/components/profile/LoyaltyProgram";
import { redirect } from "next/navigation";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { FaUser, FaGift, FaCrown } from 'react-icons/fa'; // Import icons

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id)
      .select('loyaltyProgram email name')
      .lean();

    if (!user) {
      redirect("/login");
    }

    // Convert MongoDB document to plain object and transform _id
    const serializedUser = {
      ...user,
      _id: user._id.toString(),
      loyaltyProgram: user.loyaltyProgram ? {
        ...user.loyaltyProgram,
        transactions: user.loyaltyProgram.transactions?.map(tx => ({
          ...tx,
          _id: tx._id.toString(),
          orderId: tx.orderId?.toString()
        })) || [],
        coupons: user.loyaltyProgram.coupons?.map(coupon => ({
          ...coupon,
          _id: coupon._id.toString()
        })) || []
      } : null
    };

    return (
      <div className="min-h-screen bg-secondary">
        {/* Hero Section */}
        <div className="bg-primary">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 p-3 rounded-full">
                <FaUser className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{serializedUser.name}</h1>
                <p className="mt-1 text-primary-light/80">{serializedUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Loyalty Program Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg-xl shadow-sm border border-form-input-border overflow-hidden animate-scaleSpring">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <FaCrown className="h-6 w-6 text-accent-yellow" />
                      <h2 className="text-xl font-semibold text-text-primary">VivaBucks Rewards</h2>
                    </div>
                    <span className="px-4 py-1.5 bg-secondary text-primary rounded-full text-sm font-medium">
                      {serializedUser.loyaltyProgram?.tier || 'BRONZE'}
                    </span>
                  </div>
                  <LoyaltyProgram user={serializedUser} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg-xl shadow-sm border border-form-input-border p-6 animate-slideUp">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                      <FaGift className="h-5 w-5 text-accent-blue" />
                      <span className="font-medium text-text-primary">Available Rewards</span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {serializedUser.loyaltyProgram?.coupons?.filter(c => !c.isUsed).length || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg-xl shadow-sm border border-form-input-border p-6 animate-slideUp">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {serializedUser.loyaltyProgram?.transactions?.slice(0, 3).map((tx, index) => (
                    <div key={tx._id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {tx.type === 'earn' ? 'Earned Points' : 'Redeemed Points'}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${
                        tx.type === 'earn' ? 'text-form-input-success' : 'text-form-input-error'
                      }`}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    redirect("/login");
  }
} 