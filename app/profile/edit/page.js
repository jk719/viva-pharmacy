import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import ProfileInfo from "@/components/profile/ProfileInfo";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  try {
    await dbConnect();
    const user = await User.findById(session.user.id)
      .select('email name phoneNumber addresses')
      .lean();

    if (!user) {
      redirect("/login");
    }

    // Convert MongoDB document to plain object
    const serializedUser = {
      ...user,
      _id: user._id.toString(),
      addresses: user.addresses?.map(addr => ({
        ...addr,
        _id: addr._id.toString()
      })) || []
    };

    return <ProfileInfo user={serializedUser} />;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    redirect("/login");
  }
} 