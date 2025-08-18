import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "mundo-tango-secret-key";

interface JWTPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        name: string;
        bio?: string;
        firstName?: string;
        lastName?: string;
        mobileNo?: string;
        profileImage?: string;
        backgroundImage?: string;
        country?: string;
        city?: string;
        facebookUrl?: string;
        isVerified?: boolean;
        isActive?: boolean;
        apiToken?: string;
        createdAt?: Date;
        updatedAt?: Date;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    const user = await storage.getUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNo: user.mobileNo,
      profileImage: user.profileImage,
      backgroundImage: user.backgroundImage,
      country: user.country,
      city: user.city,
      facebookUrl: user.facebookUrl,
      isVerified: user.isVerified,
      isActive: user.isActive,
      apiToken: user.apiToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Export isAuthenticated as an alias for authMiddleware for compatibility
export const isAuthenticated = authMiddleware;
