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

    const email = data.email.toLowerCase();
    const username = data.username.toLowerCase();

    const existingEmail = await db.orm.public.User.first({
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

    const existingUsername = await db.orm.public.User.first({
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

    let referrerId: string | null = null;

    if (data.referralCode) {
      const referrer = await db.orm.public.User.first({
        referralCode: data.referralCode,
      });

      if (!referrer) {
        return NextResponse.json(
          {
            message: "Invalid referral code",
          },
          {
            status: 400,
          }
        );
      }

      referrerId = referrer.id;
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    const referralCode = generateReferralCode(username);

    const user = await db.transaction(async (tx) => {
      const createdUser = await tx.orm.public.User.create({
        fullName: data.fullName,
        username,
        email,
        passwordHash,
        referralCode,
      });

      if (referrerId) {
        await tx.orm.public.Referral.create({
          referrer: (referrer) =>
            referrer.connect({
              id: referrerId!,
            }),

          referredUser: (referredUser) =>
            referredUser.connect({
              id: createdUser.id,
            }),

          level: 1,
        });
      }

      return createdUser;
    });

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
    console.error("Registration error:", error);

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