import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/prisma/db";
import { sendVerificationEmail } from "@/src/lib/email";
import {
  generateVerificationCode,
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

    const user =
      await db.orm.public.User.first({
        email,
      });

    // Do not expose whether an email exists.
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with this email, a verification code has been sent.",
      });
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        {
          message: "Email is already verified.",
        },
        { status: 400 }
      );
    }

    // 60-second resend cooldown.
    const existingTokens =
      await db.orm.public.VerificationToken
        .where({
          userId: user.id,
          type: "EMAIL_VERIFICATION",
        })
        .all();

    const latestToken = existingTokens
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )[0];

    if (
      latestToken &&
      Date.now() -
        new Date(latestToken.createdAt).getTime() <
        60 * 1000
    ) {
      return NextResponse.json(
        {
          message:
            "Please wait 60 seconds before requesting another code.",
        },
        { status: 429 }
      );
    }

    // Invalidate previous codes.
    for (const token of existingTokens) {
      if (!token.usedAt) {
        await db.orm.public.VerificationToken
          .where({ id: token.id })
          .update({
            usedAt: new Date().toISOString(),
          });
      }
    }

    const code = generateVerificationCode();

    await db.orm.public.VerificationToken.create({
      userId: user.id,
      tokenHash: hashToken(code),
      type: "EMAIL_VERIFICATION",
      expiresAt: getExpiration(15),
    });

    try {
      await sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        code,
      });
    } catch (emailError) {
      console.error(
        "Resend verification email error:",
        emailError
      );

      return NextResponse.json(
        {
          message:
            "Unable to send verification email right now. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "A new verification code has been sent.",
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Please provide a valid email.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Unable to resend verification code.",
      },
      { status: 500 }
    );
  }
}