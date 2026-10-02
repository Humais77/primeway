import {
  createHash,
  randomBytes,
  randomInt,
} from "crypto";

export function generateVerificationCode() {
  return randomInt(100000, 1000000).toString();
}

export function generateResetToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Prisma 8 TimestamptzString expects an ISO-8601 string.
 * Always use UTC ("Z") instead of Date.toString(),
 * which can produce unsupported values such as GMT+0500.
 */
export function getExpiration(minutes: number): string {
  return new Date(
    Date.now() + minutes * 60 * 1000
  ).toISOString();
}