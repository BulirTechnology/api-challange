import * as crypto from "node:crypto";

export function generateReferralCode(userId: string): string {
  // Combine user ID with a random salt
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHash("sha256").update(userId + salt).digest("hex");
  
  // Take the first 6 characters of the hash as the referral code
  const referralCode = hash.substring(0, 6).toUpperCase();
  
  return referralCode;
}