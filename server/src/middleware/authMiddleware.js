import { verifyToken } from '../controllers/authController.js';

export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { valid, decoded, error } = verifyToken(token);

    if (!valid) {
      return res.status(403).json({ error: error || 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default authenticateToken;
