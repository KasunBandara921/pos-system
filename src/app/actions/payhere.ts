"use server";

import crypto from "crypto";

/**
 * Generates PayHere MD5 checkout verification hash.
 * md5(Merchant ID + Order ID + Formatted Amount + Currency + md5(Merchant Secret))
 */
export async function generatePayHereHash(
  orderId: string,
  amount: number
): Promise<string> {
  const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || "1211149";
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "";
  const currency = "LKR";

  // Format amount to exactly two decimal places (e.g. 150.00)
  const formattedAmount = amount.toFixed(2);

  // Generate MD5 of the merchant secret in uppercase
  const md5Secret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  // Combine params to hash
  const rawString =
    merchantId + orderId + formattedAmount + currency + md5Secret;

  // Generate main MD5 verification hash in uppercase
  const finalHash = crypto
    .createHash("md5")
    .update(rawString)
    .digest("hex")
    .toUpperCase();

  return finalHash;
}
