"use server";

import db from "../../lib/db";

export interface SystemSettingsData {
  taxRate: number;
  spendingLimitEnabled: boolean;
  spendingLimit: number;
  spendingDiscountType: string;
  spendingDiscountValue: number;
}

// Fetch system settings, seeding the default configuration if none exists
export async function getSystemSettings(): Promise<SystemSettingsData> {
  const prisma = db as any;
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "default",
          taxRate: 8.5,
          spendingLimitEnabled: false,
          spendingLimit: 5000.0,
          spendingDiscountType: "percentage",
          spendingDiscountValue: 5.0,
        },
      });
    }

    return {
      taxRate: settings.taxRate,
      spendingLimitEnabled: settings.spendingLimitEnabled,
      spendingLimit: settings.spendingLimit,
      spendingDiscountType: settings.spendingDiscountType,
      spendingDiscountValue: settings.spendingDiscountValue,
    };
  } catch (error) {
    console.error("Failed to fetch system settings:", error);
    // Fallback to default in-memory settings if DB query fails to avoid app crash
    return {
      taxRate: 8.5,
      spendingLimitEnabled: false,
      spendingLimit: 5000.0,
      spendingDiscountType: "percentage",
      spendingDiscountValue: 5.0,
    };
  }
}

// Update system settings configuration
export async function updateSystemSettings(
  data: SystemSettingsData
): Promise<{ success: boolean; error?: string }> {
  const prisma = db as any;
  try {
    await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        taxRate: data.taxRate,
        spendingLimitEnabled: data.spendingLimitEnabled,
        spendingLimit: data.spendingLimit,
        spendingDiscountType: data.spendingDiscountType,
        spendingDiscountValue: data.spendingDiscountValue,
      },
      create: {
        id: "default",
        taxRate: data.taxRate,
        spendingLimitEnabled: data.spendingLimitEnabled,
        spendingLimit: data.spendingLimit,
        spendingDiscountType: data.spendingDiscountType,
        spendingDiscountValue: data.spendingDiscountValue,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update system settings:", error);
    return { success: false, error: "Database error during settings update." };
  }
}

export interface DiscountRuleData {
  id: string;
  minSubtotal: number;
  discountType: string;
  discountValue: number;
}

// Fetch all tiered spending discount rules
export async function getDiscountRules(): Promise<DiscountRuleData[]> {
  const prisma = db as any;
  try {
    const rules = await prisma.spendingDiscountRule.findMany({
      orderBy: { minSubtotal: "asc" },
    });
    return rules;
  } catch (error) {
    console.error("Failed to fetch discount rules:", error);
    return [];
  }
}

// Create a new tiered spending discount rule
export async function createDiscountRule(
  minSubtotalInput: number,
  discountTypeInput: string,
  discountValueInput: number
): Promise<{ success: boolean; error?: string }> {
  const prisma = db as any;
  try {
    const existing = await prisma.spendingDiscountRule.findUnique({
      where: { minSubtotal: minSubtotalInput },
    });
    if (existing) {
      return { success: false, error: "A discount rule with this threshold already exists." };
    }

    await prisma.spendingDiscountRule.create({
      data: {
        minSubtotal: minSubtotalInput,
        discountType: discountTypeInput,
        discountValue: discountValueInput,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to create discount rule:", error);
    return { success: false, error: "Database error during rule creation." };
  }
}

// Delete an existing tiered spending discount rule
export async function deleteDiscountRule(
  idInput: string
): Promise<{ success: boolean; error?: string }> {
  const prisma = db as any;
  try {
    await prisma.spendingDiscountRule.delete({
      where: { id: idInput },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete discount rule:", error);
    return { success: false, error: "Database error during rule deletion." };
  }
}
