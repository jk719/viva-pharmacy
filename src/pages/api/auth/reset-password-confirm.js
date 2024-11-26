import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, password } = req.body;
    console.log("Reset password attempt - Token length:", token?.length);
    
    await dbConnect();
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log("No user found with valid reset token");
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    console.log("Found user for reset:", {
      email: user.email,
      currentPasswordHash: user.password?.substring(0, 20) + '...'
    });

    // IMPORTANT: Set plain password, let User model handle hashing
    user.password = password;  // Do NOT hash here, let the pre-save hook do it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    console.log("About to save plain password for user:", user.email);
    await user.save();

    console.log("Password reset successful - Final hash:", user.password?.substring(0, 20) + '...');
    
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password confirmation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}