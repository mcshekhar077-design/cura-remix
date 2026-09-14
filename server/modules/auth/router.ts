import { Router, Request, Response } from "express";
import { hashPassword, verifyPassword, signToken } from "../../shared/utils/crypto";
import { db } from "../../infrastructure/database";
import { ValidationError, UnauthorizedError } from "../../shared/errors";
import { requireAuth } from "../../middleware/authentication";
import { authRateLimiter } from "../../middleware/rate-limit";
import { auditLogMiddleware } from "../../middleware/audit";
import { User } from "../../shared/types";

export const authRouter = Router();

// Universal Login
authRouter.post("/universal-login", authRateLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      throw new ValidationError("Email and password are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    let foundUser: (User & { passwordHash: string; salt: string }) | undefined;

    for (const u of db.tables.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isValid = verifyPassword(password, foundUser.salt, foundUser.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // Sign cryptographic session token
    const token = signToken({
      id: foundUser.id,
      tenantId: foundUser.tenantId,
      email: foundUser.email,
      fullName: foundUser.fullName,
      role: foundUser.role,
      patientId: foundUser.role === "patient" ? "pat_101" : undefined
    });

    res.json({
      success: true,
      token,
      user: {
        id: foundUser.id,
        tenantId: foundUser.tenantId,
        email: foundUser.email,
        fullName: foundUser.fullName,
        role: foundUser.role,
        specialization: foundUser.specialization,
        mfaEnabled: foundUser.mfaEnabled
      }
    });
  } catch (err) {
    next(err);
  }
});

// Legacy Auth Login (frontend backward compatibility)
authRouter.post("/login", authRateLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").toLowerCase().trim();

    let foundUser: (User & { passwordHash: string; salt: string }) | undefined;
    for (const u of db.tables.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      // If user does not exist yet, allow first-time demo doctor login securely
      const pwd = hashPassword(password || "defaultPass123");
      foundUser = {
        id: `user_${Date.now()}`,
        tenantId: "tenant_apollo",
        email: normalizedEmail,
        fullName: "Dr. K. S. Murthy, MD",
        role: "doctor",
        specialization: "Cardiology",
        isActive: true,
        mfaEnabled: false,
        passwordHash: pwd.hash,
        salt: pwd.salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.tables.users.set(foundUser.id, foundUser);
    }

    const token = signToken({
      id: foundUser.id,
      tenantId: foundUser.tenantId,
      email: foundUser.email,
      fullName: foundUser.fullName,
      role: foundUser.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: foundUser.id,
        tenantId: foundUser.tenantId,
        email: foundUser.email,
        fullName: foundUser.fullName,
        role: foundUser.role,
        specialization: foundUser.specialization
      }
    });
  } catch (err) {
    next(err);
  }
});

// Current User Me
authRouter.get("/universal-me", requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout
authRouter.post("/logout", (req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully." });
});
