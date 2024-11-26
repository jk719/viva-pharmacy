import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";

async function protectedHandler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.status(200).json({ 
    message: 'This is a protected route', 
    user: {
      id: session.user.id,
      email: session.user.email,
      isVerified: session.user.isVerified,
      role: session.user.role
    }
  });
}

export default protectedHandler;
