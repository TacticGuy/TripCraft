import express from 'express';
import { handleGoogleLogin, handleSignup, handleLogin, verifyToken, getUserById, handleEmailVerification } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google OAuth callback
router.post('/auth/google', async (req, res) => {
  try {
    const { googleToken, profile } = req.body;

    if (!googleToken || !profile) {
      return res.status(400).json({ error: 'Missing googleToken or profile' });
    }

    const result = await handleGoogleLogin(googleToken, profile);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email/Password signup
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields: email, password, fullName' });
    }

    const result = await handleSignup(email, password, fullName);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email/Password login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await handleLogin(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error, requiresEmailVerification: result.requiresEmailVerification });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email verification callback
router.post('/auth/verify-email', async (req, res) => {
  try {
    const { token, type = 'email' } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing verification token' });
    }

    const result = await handleEmailVerification(token, type);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token and get current user
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await getUserById(req.user.userId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.full_name,
        avatar: result.user.avatar_url,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
