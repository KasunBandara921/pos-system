"use server";

import db from "../../lib/db";
import { randomBytes, pbkdf2Sync } from "crypto";

// Hashing Helpers using native Node.js PBKDF2
function hashString(value: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(value, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyHash(value: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const verifyHash = pbkdf2Sync(value, salt, 1000, 64, "sha512").toString("hex");
    return hash === verifyHash;
  } catch (err) {
    return false;
  }
}

export interface SafeUser {
  id: string;
  name: string;
  username: string;
  role: string;
}

// Seed admin/cashier accounts if DB is empty
export async function seedUsers(): Promise<void> {
  const prisma = db as any;
  try {
    const count = await prisma.user.count();
    if (count === 0) {
      console.log("Seeding default POS users...");
      
      // Seed default manager (admin / admin123 / PIN: 1234)
      await prisma.user.create({
        data: {
          name: "Lewdeniya Manager",
          username: "admin",
          password: hashString("admin123"),
          pin: hashString("1234"),
          role: "manager",
        },
      });

      // Seed default cashier (cashier / cashier123 / PIN: 5678)
      await prisma.user.create({
        data: {
          name: "Sumana Cashier",
          username: "cashier",
          password: hashString("cashier123"),
          pin: hashString("5678"),
          role: "cashier",
        },
      });
      
      console.log("Seeding complete.");
    }
  } catch (error) {
    console.error("Failed to seed POS users:", error);
  }
}

// Sign in with Username / Password
export async function loginWithCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; user?: SafeUser }> {
  const prisma = db as any;
  try {
    const user = await prisma.user.findUnique({
      where: { username: usernameInput.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid username or password." };
    }

    const isValid = verifyHash(passwordInput, user.password);
    if (!isValid) {
      return { success: false, error: "Invalid username or password." };
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Login credentials check failed:", error);
    return { success: false, error: "Authentication system error." };
  }
}

// Quick Switch or Unlock with PIN
export async function loginWithPin(
  pinInput: string
): Promise<{ success: boolean; error?: string; user?: SafeUser }> {
  const prisma = db as any;
  try {
    const users = await prisma.user.findMany();
    
    // Scan users for a matching PIN hash (standard approach when PIN size is small)
    let authenticatedUser = null;
    for (const u of users) {
      if (verifyHash(pinInput, u.pin)) {
        authenticatedUser = u;
        break;
      }
    }

    if (!authenticatedUser) {
      return { success: false, error: "Invalid PIN." };
    }

    return {
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        username: authenticatedUser.username,
        role: authenticatedUser.role,
      },
    };
  } catch (error) {
    console.error("PIN check failed:", error);
    return { success: false, error: "PIN authentication error." };
  }
}

// Validate Manager PIN for action overrides
export async function verifyManagerPinOverride(
  pinInput: string
): Promise<{ success: boolean; error?: string; managerName?: string }> {
  const prisma = db as any;
  try {
    // Find all manager users
    const managers = await prisma.user.findMany({
      where: { role: "manager" },
    });

    let authenticatedManager = null;
    for (const m of managers) {
      if (verifyHash(pinInput, m.pin)) {
        authenticatedManager = m;
        break;
      }
    }

    if (!authenticatedManager) {
      return { success: false, error: "Invalid Manager PIN." };
    }

    return {
      success: true,
      managerName: authenticatedManager.name,
    };
  } catch (error) {
    console.error("Manager override check failed:", error);
    return { success: false, error: "System override verification error." };
  }
}

// Fetch list of active users to display on the Lock Screen profiles
export async function getActiveProfiles(): Promise<SafeUser[]> {
  const prisma = db as any;
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to load profiles:", error);
    return [];
  }
}
