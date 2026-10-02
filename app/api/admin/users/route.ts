import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const users =
      await db.orm.public.User
        .orderBy((user) => user.createdAt.desc())
        .all();

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        referralCode: user.referralCode,
        balancePaisa: user.balancePaisa,
        totalInvestmentPaisa: user.totalInvestmentPaisa,
        totalProfitPaisa: user.totalProfitPaisa,
        totalReferralPaisa: user.totalReferralPaisa,
        totalWithdrawnPaisa: user.totalWithdrawnPaisa,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin users GET error:", error);

    return NextResponse.json(
      { message: "Unable to load users." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const role =
      body.role === "ADMIN" ? "ADMIN" : "USER";

    const isActive =
      typeof body.isActive === "boolean"
        ? body.isActive
        : true;

    const balancePaisa =
      Number.isInteger(body.balancePaisa) &&
      body.balancePaisa >= 0
        ? body.balancePaisa
        : 0;

    if (!fullName) {
      return NextResponse.json(
        { message: "Full name is required." },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "A valid email is required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Duplicate checks — OR is not available in this client,
    // so do two lookups.
    const usernameTaken =
      await db.orm.public.User.first({ username });

    if (usernameTaken) {
      return NextResponse.json(
        { message: "Username already exists." },
        { status: 409 }
      );
    }

    const emailTaken =
      await db.orm.public.User.first({ email });

    if (emailTaken) {
      return NextResponse.json(
        { message: "Email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const referralCode = await generateReferralCode();

    const user = await db.orm.public.User.create({
      fullName,
      username,
      email,
      passwordHash,
      role,
      referralCode,
      isActive,
      balancePaisa,
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: "User created successfully.",
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          referralCode: user.referralCode,
          balancePaisa: user.balancePaisa,
          totalInvestmentPaisa: user.totalInvestmentPaisa,
          totalProfitPaisa: user.totalProfitPaisa,
          totalReferralPaisa: user.totalReferralPaisa,
          totalWithdrawnPaisa: user.totalWithdrawnPaisa,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin users POST error:", error);

    // Map unique-constraint violations to 409 instead of 500.
    const message =
      error instanceof Error ? error.message : "";

    if (
      message.includes("Unique constraint") ||
      message.includes("unique constraint") ||
      message.includes("P2002")
    ) {
      return NextResponse.json(
        { message: "Username or email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to create user." },
      { status: 500 }
    );
  }
}

async function generateReferralCode(): Promise<string> {
  // 8-char uppercase alphanumeric. Retry on collision.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 5; attempt++) {
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += alphabet[
        Math.floor(Math.random() * alphabet.length)
      ];
    }

    const clash = await db.orm.public.User.first({
      referralCode: code,
    });

    if (!clash) return code;
  }

  throw new Error("REFERRAL_CODE_GENERATION_FAILED");
}