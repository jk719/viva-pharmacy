import authMiddleware from '../../../middleware/auth';

async function protectedHandler(req, res) {
  res.status(200).json({ message: 'This is a protected route', user: req.user });
}

export default authMiddleware(protectedHandler);
