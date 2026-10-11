
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { z } from "zod";

import { db } from "@/src/prisma/db";

const USERNAME_REGEX = /^[a-zA-Z0-9_.@+-]{3,30}$/;

const RegisterSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(
      USERNAME_REGEX,
      "Username must be 3–30 characters and may contain only letters, numbers, underscores, dots, @, +, and hyphens."
    ),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  referralCode: z.string().optional(),
});

function generateReferralCode(username: string) {
  return `${username.slice(0, 5).toUpperCase()}${randomInt(
    100000,
    1000000
  )}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = RegisterSchema.parse(body);

    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    const username = data.username.trim().toLowerCase();

    const referralCodeInput =
      data.referralCode?.trim().toUpperCase() || null;

    // Check existing email.
    const existingEmail = await db.orm.public.User.first({
      email,
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Email is already registered." },
        { status: 409 }
      );
    }

    // Check existing username.
    const existingUsername = await db.orm.public.User.first({
      username,
    });

    if (existingUsername) {
      return NextResponse.json(
        { message: "Username is already taken." },
        { status: 409 }
      );
    }

    // Find optional referrer.
    let referrer: { id: string } | null = null;

    if (referralCodeInput) {
      const foundReferrer = await db.orm.public.User.first({
        referralCode: referralCodeInput,
      });

      if (!foundReferrer) {
        return NextResponse.json(
          { message: "Invalid referral code." },
          { status: 400 }
        );
      }

      if (
        foundReferrer.email === email ||
        foundReferrer.username === username
      ) {
        return NextResponse.json(
          { message: "You cannot use your own referral code." },
          { status: 400 }
        );
      }

      referrer = { id: foundReferrer.id };
    }

    // Keep the existing secure password hashing.
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate a unique referral code.
    let generatedReferralCode = "";
    let codeExists = true;

    while (codeExists) {
      generatedReferralCode = generateReferralCode(username);

      const existingCode = await db.orm.public.User.first({
        referralCode: generatedReferralCode,
      });

      codeExists = !!existingCode;
    }

    // Create user and optional referral relationship atomically.
    const user = await db.transaction(async (tx) => {
      const createdUser = await tx.orm.public.User.create({
        fullName,
        username,
        email,
        passwordHash,
        referralCode: generatedReferralCode,
        referralLevel: 1,

        // Email verification is no longer required.
        isEmailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
      });

      if (referrer) {
        await tx.orm.public.Referral.create({
          referrerId: referrer.id,
          referredUserId: createdUser.id,
          level: 1,
        });
      }

      // No verification code or token is created.

      return createdUser;
    });

    return NextResponse.json(
      {
        message: "Registration successful. You can now log in.",
        userId: user.id,
        email: user.email,
        emailSent: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid input.",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "";

    if (
      message.includes("Unique constraint") ||
      message.includes("unique constraint") ||
      message.includes("P2002")
    ) {
      return NextResponse.json(
        { message: "Username, email, or referral code already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
