import { Router } from 'express';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { insertUserSchema } from '../../shared/schema';
import { authService } from '../services/authService';
import { randomBytes } from 'crypto';

const router = Router();

// User authentication status check
router.get("/auth/user", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUserByReplitId(userId);
    
    if (!user) {
      // Auto-create user if doesn't exist
      const newUser = await storage.createUser({
        replitId: userId,
        email: req.user.claims.email,
        username: req.user.claims.username || `user${userId}`,
        name: req.user.claims.name || 'Anonymous User',
        profileImage: req.user.claims.profile_image_url || '/images/default-avatar.svg'
      });
      return res.json(newUser);
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Logout endpoint
router.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

// Password reset request
router.post("/auth/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token in database
    await storage.createPasswordResetToken(email, token, expires);
    
    // TODO: Send email with reset link
    
    res.json({ 
      success: true, 
      message: "Password reset email sent if account exists" 
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Password reset
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    // Verify token
    const resetToken = await storage.getPasswordResetToken(token);
    
    if (!resetToken || resetToken.expires < new Date()) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    await storage.updateUserPassword(resetToken.email, hashedPassword);
    
    // Delete used token
    await storage.deletePasswordResetToken(token);
    
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// CSRF token endpoint
router.get("/auth/csrf", (req, res) => {
  res.json({ csrfToken: req.csrfToken ? req.csrfToken() : null });
});

export default router;