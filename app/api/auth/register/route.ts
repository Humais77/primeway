import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { randomInt } from "crypto";

import { z } from "zod";

import { db } from "@/src/prisma/db";

import { sendVerificationEmail } from "@/src/lib/email";

import {
  generateVerificationCode,
  getExpiration,
  hashToken,
} from "@/src/lib/email-token";

const RegisterSchema = z.object({
  fullName: z.string().min(2).max(100),

  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),

  email: z.string().email(),

  password: z.string().min(8),

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

    /*
     * Check existing email.
     */
    const existingEmail =
      await db.orm.public.User.first({
        email,
      });

    if (existingEmail) {
      if (!existingEmail.isEmailVerified) {
        return NextResponse.json(
          {
            message:
              "This email is registered but not verified. Please verify your email.",

            userId: existingEmail.id,

            email: existingEmail.email,
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          message: "Email is already registered.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Check existing username.
     */
    const existingUsername =
      await db.orm.public.User.first({
        username,
      });

    if (existingUsername) {
      return NextResponse.json(
        {
          message: "Username is already taken.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Find referrer.
     */
    let referrer:
      | {
          id: string;
          referralCode: string;
          referralLevel: number;
        }
      | null = null;

    if (referralCodeInput) {
      const foundReferrer =
        await db.orm.public.User.first({
          referralCode: referralCodeInput,
        });

      if (!foundReferrer) {
        return NextResponse.json(
          {
            message: "Invalid referral code.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Prevent self-referral.
       *
       * This normally cannot happen because the new
       * user's referral code does not exist yet,
       * but keeping the protection here is safer.
       */
      if (foundReferrer.email === email) {
        return NextResponse.json(
          {
            message:
              "You cannot use your own referral code.",
          },
          {
            status: 400,
          }
        );
      }

      referrer = {
        id: foundReferrer.id,
        referralCode: foundReferrer.referralCode,
        referralLevel:
          foundReferrer.referralLevel ?? 1,
      };
    }

    /*
     * Hash password.
     */
    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    /*
     * Generate unique referral code.
     */
    let generatedReferralCode = "";

    let codeExists = true;

    while (codeExists) {
      generatedReferralCode =
        generateReferralCode(username);

      const existingCode =
        await db.orm.public.User.first({
          referralCode: generatedReferralCode,
        });

      codeExists = !!existingCode;
    }

    /*
     * Create user + referral relationships
     * in one transaction.
     */
    const result = await db.transaction(
      async (tx) => {
        /*
         * Every new user starts at Level 1.
         */
        const createdUser =
          await tx.orm.public.User.create({
            fullName,

            username,

            email,

            passwordHash,

            referralCode:
              generatedReferralCode,

            referralLevel: 1,

            isEmailVerified: false,
          });

        if (referrer) {
          /*
           * ------------------------------------------------
           * LEVEL 1 RELATIONSHIP
           * ------------------------------------------------
           *
           * Example:
           *
           * A refers B
           *
           * A → B = Level 1
           */
          await tx.orm.public.Referral.create({
            referrerId: referrer.id,

            referredUserId: createdUser.id,

            level: 1,
          });

          /*
           * ------------------------------------------------
           * UPDATE REFERRER'S OWN LEVEL
           * ------------------------------------------------
           *
           * Every user starts at Level 1.
           *
           * After successfully referring someone,
           * the referrer becomes Level 2.
           *
           * If already Level 2, remain Level 2.
           */
          if (referrer.referralLevel < 2) {
            await tx.orm.public.User
              .where({
                id: referrer.id,
              })
              .update({
                referralLevel: 2,
              });
          }

          /*
           * ------------------------------------------------
           * LEVEL 2 RELATIONSHIP
           * ------------------------------------------------
           *
           * Example:
           *
           * A → B
           * B → C
           *
           * Existing parent relationship:
           *
           * A → B = Level 1
           *
           * New relationship:
           *
           * A → C = Level 2
           */
          const parentReferral =
            await tx.orm.public.Referral.first({
              referredUserId: referrer.id,

              level: 1,
            });

          if (
            parentReferral &&
            parentReferral.referrerId !==
              createdUser.id
          ) {
            await tx.orm.public.Referral.create({
              referrerId:
                parentReferral.referrerId,

              referredUserId:
                createdUser.id,

              level: 2,
            });
          }
        }

        /*
         * Create email verification token.
         */
        const verificationCode =
          generateVerificationCode();

        const tokenHash =
          hashToken(verificationCode);

        await tx.orm.public.VerificationToken.create({
          userId: createdUser.id,

          tokenHash,

          type: "EMAIL_VERIFICATION",

          expiresAt: getExpiration(15),
        });

        return {
          user: createdUser,

          verificationCode,
        };
      }
    );

    /*
     * Send verification email only after
     * successful database transaction.
     */
    try {
      await sendVerificationEmail({
        email,

        fullName,

        code: result.verificationCode,
      });
    } catch (emailError) {
      console.error(
        "Verification email error:",
        emailError
      );

      return NextResponse.json(
        {
          message:
            "Account created, but we could not send the verification email. Please use the resend option.",

          userId: result.user.id,

          email,

          emailSent: false,
        },
        {
          status: 201,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email for the verification code.",

        userId: result.user.id,

        email,

        emailSent: true,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid input.",

          errors: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}