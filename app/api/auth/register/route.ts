import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { z } from "zod";

import { db } from "@/src/prisma/db";

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
  return `${username
    .slice(0, 5)
    .toUpperCase()}${randomInt(100000, 1000000)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = RegisterSchema.parse(body);

    const email = data.email.trim().toLowerCase();
    const username = data.username.trim().toLowerCase();

    const referralCodeInput =
      data.referralCode?.trim().toUpperCase() || null;

    /*
     * Check duplicate email.
     */
    const existingEmail =
      await db.orm.public.User.first({
        email,
      });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "Email is already registered",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Check duplicate username.
     */
    const existingUsername =
      await db.orm.public.User.first({
        username,
      });

    if (existingUsername) {
      return NextResponse.json(
        {
          message: "Username is already taken",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Find direct referrer.
     */
    let referrer:
      | {
          id: string;
          referralCode: string;
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
            message: "Invalid referral code",
          },
          {
            status: 400,
          }
        );
      }

      referrer = foundReferrer;
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    /*
     * Generate a unique referral code.
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
     * inside one transaction.
     */
    const user = await db.transaction(
      async (tx) => {
        const createdUser =
          await tx.orm.public.User.create({
            fullName: data.fullName.trim(),
            username,
            email,
            passwordHash,
            referralCode:
              generatedReferralCode,
          });

        if (referrer) {
          /*
           * LEVEL 1
           *
           * New user -> direct referrer
           *
           * Example:
           *
           * Humais -> Ali
           *
           * Ali is Humais's Level 1.
           */
          await tx.orm.public.Referral.create({
            referrerId: referrer.id,
            referredUserId: createdUser.id,
            level: 1,
          });

          /*
           * LEVEL 2
           *
           * Find the person who referred
           * the direct referrer.
           *
           * Example:
           *
           * Humais -> Ali -> Ahmed
           *
           * Ahmed:
           * Ali    = Level 1
           * Humais = Level 2
           */
          const parentReferral =
            await tx.orm.public.Referral.first({
              referredUserId: referrer.id,
              level: 1,
            });

          if (parentReferral) {
            await tx.orm.public.Referral.create({
              referrerId:
                parentReferral.referrerId,

              referredUserId:
                createdUser.id,

              level: 2,
            });
          }
        }

        return createdUser;
      }
    );

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: user.id,
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
          message: "Invalid input",
          errors: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}