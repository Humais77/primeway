import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/src/lib/db";
import User from "@/src/models/User";

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
  return `${username.slice(0, 5).toUpperCase()}${Math.floor(
    100000 + Math.random() * 900000
  )}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = RegisterSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({
      $or: [
        { email: data.email.toLowerCase() },
        { username: data.username.toLowerCase() },
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 409,
        }
      );
    }

    let referredBy = null;

    if (data.referralCode) {
      const referrer = await User.findOne({
        referralCode: data.referralCode,
      });

      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    const user = await User.create({
      fullName: data.fullName,
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      passwordHash,
      referralCode: generateReferralCode(data.username),
      referredBy,
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        userId: user._id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
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

    console.error(error);

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