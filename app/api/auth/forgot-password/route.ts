import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/prisma/db";
import { sendPasswordResetEmail } from "@/src/lib/email";
import {
  generateResetToken,
  getExpiration,
  hashToken,
} from "@/src/lib/email-token";

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = Schema.parse(body);

    const email = data.email
      .trim()
      .toLowerCase();

    const genericMessage =
      "If an account exists with this email, a password reset link has been sent.";

    const user =
      await db.orm.public.User.first({
        email,
      });

    // Prevent email enumeration.
    if (!user) {
      return NextResponse.json({
        message: genericMessage,
      });
    }

    if (!user.isActive) {
      return NextResponse.json({
        message: genericMessage,
      });
    }

    // 60-second cooldown.
    const tokens =
      await db.orm.public.VerificationToken
        .where({
          userId: user.id,
          type: "PASSWORD_RESET",
        })
        .all();

    const latestToken = tokens
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )[0];

    if (
      latestToken &&
      Date.now() -
        new Date(
          latestToken.createdAt
        ).getTime() <
        60 * 1000
    ) {
      return NextResponse.json(
        {
          message: genericMessage,
        }
      );
    }

    // Invalidate old reset tokens.
    for (const token of tokens) {
      if (!token.usedAt) {
        await db.orm.public.VerificationToken
          .where({ id: token.id })
          .update({
            usedAt: new Date().toISOString(),
          });
      }
    }

    const resetToken =
      generateResetToken();

    await db.orm.public.VerificationToken.create({
      userId: user.id,
      tokenHash: hashToken(resetToken),
      type: "PASSWORD_RESET",
      expiresAt: getExpiration(15),
    });

    try {
      await sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        token: resetToken,
      });
    } catch (emailError) {
      console.error(
        "Password reset email error:",
        emailError
      );

      return NextResponse.json({
        message: genericMessage,
      });
    }

    return NextResponse.json({
      message: genericMessage,
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Please enter a valid email.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Unable to process request.",
      },
      { status: 500 }
    );
  }
}