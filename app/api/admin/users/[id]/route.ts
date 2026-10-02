import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const user =
      await db.orm.public.User.first({
        id,
      });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        referralCode: user.referralCode,
        balancePaisa: user.balancePaisa,
        totalInvestmentPaisa:
          user.totalInvestmentPaisa,
        totalProfitPaisa:
          user.totalProfitPaisa,
        totalReferralPaisa:
          user.totalReferralPaisa,
        totalWithdrawnPaisa:
          user.totalWithdrawnPaisa,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("User GET error:", error);

    return NextResponse.json(
      { message: "Unable to load user." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing =
      await db.orm.public.User.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (typeof body.fullName === "string") {
      const fullName = body.fullName.trim();
      if (fullName.length > 0) {
        update.fullName = fullName;
      }
    }

    if (typeof body.username === "string") {
      const username = body.username.trim();
      if (username.length > 0) {
        update.username = username;
      }
    }

    if (typeof body.email === "string") {
      const email = body.email
        .trim()
        .toLowerCase();
      if (email.length > 0) {
        update.email = email;
      }
    }

    if (
      body.role === "USER" ||
      body.role === "ADMIN"
    ) {
      update.role = body.role;
    }

    if (typeof body.isActive === "boolean") {
      update.isActive = body.isActive;
    }

    if (
      Number.isInteger(body.balancePaisa) &&
      body.balancePaisa >= 0
    ) {
      update.balancePaisa =
        body.balancePaisa;
    }

    if (
      Number.isInteger(body.totalInvestmentPaisa) &&
      body.totalInvestmentPaisa >= 0
    ) {
      update.totalInvestmentPaisa =
        body.totalInvestmentPaisa;
    }

    if (
      Number.isInteger(body.totalProfitPaisa) &&
      body.totalProfitPaisa >= 0
    ) {
      update.totalProfitPaisa =
        body.totalProfitPaisa;
    }

    if (
      Number.isInteger(body.totalReferralPaisa) &&
      body.totalReferralPaisa >= 0
    ) {
      update.totalReferralPaisa =
        body.totalReferralPaisa;
    }

    if (
      Number.isInteger(body.totalWithdrawnPaisa) &&
      body.totalWithdrawnPaisa >= 0
    ) {
      update.totalWithdrawnPaisa =
        body.totalWithdrawnPaisa;
    }

    if (
      typeof body.password === "string" &&
      body.password.length >= 8
    ) {
      update.passwordHash =
        await bcrypt.hash(
          body.password,
          12
        );
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update." },
        { status: 400 }
      );
    }

    const user =
      await db.orm.public.User
        .where({ id })
        .update(update);

    if (!user) {
      return NextResponse.json(
        { message: "Unable to update user." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully.",
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        balancePaisa: user.balancePaisa,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("User PATCH error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to update user. Check for duplicate username/email.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (id === admin.userId) {
      return NextResponse.json(
        {
          message:
            "You cannot delete your own admin account.",
        },
        { status: 400 }
      );
    }

    const user =
      await db.orm.public.User.first({
        id,
      });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    await db.orm.public.User
      .where({ id })
      .delete();

    return NextResponse.json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("User DELETE error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to delete user.",
      },
      { status: 500 }
    );
  }
}