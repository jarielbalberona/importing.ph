import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

export interface ClerkRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    orgId?: string;
    orgRole?: string;
    orgSlug?: string;
    has: (permission: string) => boolean;
  };
}

export const clerkAuthMiddleware = async (
  req: ClerkRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Attach user info to request
    req.auth = {
      userId: payload.sub,
      sessionId: payload.sid,
      has: (permission: string) => {
        // Implement permission checking logic if needed
        return true;
      }
    };

    next();
  } catch (error) {
    console.error("Clerk auth error:", error);
    return res.status(401).json({ error: "Authentication failed" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return async (req: ClerkRequest, res: Response, next: NextFunction) => {
    try {
      // Get user role from database
      // This would need to be implemented based on your user service
      const userRole = req.auth?.userId ? await getUserRole(req.auth.userId) : null;
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({ error: "Role verification failed" });
    }
  };
};

// Helper function to get user role from database
async function getUserRole(userId: string): Promise<string | null> {
  // This would query your database for the user's role
  // Implementation depends on your user service
  return null;
}
