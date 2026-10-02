import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/src/prisma/db";
import { hashToken } from "@/src/lib/email-token";

const Schema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = Schema.parse(body);

    const tokenHash =
      hashToken(data.token);

    const resetToken =
      await db.orm.public.VerificationToken.first({
        tokenHash,
        type: "PASSWORD_RESET",
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          message:
            "Invalid or expired password reset link.",
        },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        {
          message:
            "This password reset link has already been used.",
        },
        { status: 400 }
      );
    }

    if (
      new Date(resetToken.expiresAt).getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "This password reset link has expired.",
        },
        { status: 400 }
      );
    }

    const passwordHash =
      await bcrypt.hash(data.password, 12);

    await db.transaction(async (tx) => {
      await tx.orm.public.User
        .where({
          id: resetToken.userId,
        })
        .update({
          passwordHash,
        });

      await tx.orm.public.VerificationToken
        .where({
          id: resetToken.id,
        })
        .update({
          usedAt: new Date().toISOString(),
        });

      // Invalidate all other reset tokens.
      const otherTokens =
        await tx.orm.public.VerificationToken
          .where({
            userId: resetToken.userId,
            type: "PASSWORD_RESET",
          })
          .all();

      for (const token of otherTokens) {
        if (
          token.id !== resetToken.id &&
          !token.usedAt
        ) {
          await tx.orm.public.VerificationToken
            .where({
              id: token.id,
            })
            .update({
              usedAt: new Date().toISOString(),
            });
        }
      }
    });

    return NextResponse.json({
      message:
        "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid password reset request.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Unable to reset password.",
      },
      { status: 500 }
    );
  }
}