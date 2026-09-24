import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/src/lib/db";
import User from "@/src/models/User";
import { createSession } from "@/src/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = LoginSchema.parse(body);

    await connectDB();

    const user = await User.findOne({
      email: data.email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          message: "Your account is disabled",
        },
        {
          status: 403,
        }
      );
    }

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    await createSession({
      userId: user._id.toString(),
      role: user.role,
    });

    return NextResponse.json({
      message: "Login successful",
      role: user.role,
    });
  } catch (error) {
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