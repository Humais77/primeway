import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/prisma/db";

import { createSession } from "@/src/lib/auth";
import { hashToken } from "@/src/lib/email-token";

const VerifySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = VerifySchema.parse(body);

    const email = data.email
      .trim()
      .toLowerCase();

    const user =
      await db.orm.public.User.first({
        email,
      });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid verification request.",
        },
        { status: 400 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        message: "Email is already verified.",
      });
    }

    const tokenHash = hashToken(data.code);

    const token =
      await db.orm.public.VerificationToken.first({
        userId: user.id,
        tokenHash,
        type: "EMAIL_VERIFICATION",
      });

    if (!token) {
      return NextResponse.json(
        {
          message: "Invalid verification code.",
        },
        { status: 400 }
      );
    }

    if (token.usedAt) {
      return NextResponse.json(
        {
          message: "This verification code has already been used.",
        },
        { status: 400 }
      );
    }

    if (
      new Date(token.expiresAt).getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          message:
            "Verification code has expired. Please request a new code.",
        },
        { status: 400 }
      );
    }

    await db.transaction(async (tx) => {
      await tx.orm.public.User
        .where({ id: user.id })
        .update({
          isEmailVerified: true,
          emailVerifiedAt: new Date().toISOString(),
        });

      await tx.orm.public.VerificationToken
        .where({ id: token.id })
        .update({
          usedAt: new Date().toISOString(),
        });

      // Invalidate any other verification codes.
      const otherTokens =
        await tx.orm.public.VerificationToken
          .where({
            userId: user.id,
            type: "EMAIL_VERIFICATION",
          })
          .all();

      for (const otherToken of otherTokens) {
        if (
          otherToken.id !== token.id &&
          !otherToken.usedAt
        ) {
          await tx.orm.public.VerificationToken
            .where({ id: otherToken.id })
            .update({
              usedAt: new Date().toISOString(),
            });
        }
      }
    });

    return NextResponse.json({
      message:
        "Email verified successfully.",
    });
  } catch (error) {
    console.error(
      "Email verification error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid verification code.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Unable to verify email.",
      },
      { status: 500 }
    );
  }
}