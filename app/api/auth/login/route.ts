import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/src/prisma/db";
import { createSession } from "@/src/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = LoginSchema.parse(body);

    const email = data.email.toLowerCase();

    const user = await db.orm.public.User.first({
      email,
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

    // Create login session
    await createSession({
      userId: user.id,
      role: user.role,
    });

    // Create login notification
    try {
      await db.orm.public.Notification.create({
        user: (notificationUser) =>
          notificationUser.connect({
            id: user.id,
          }),

        title: "Login successful",

        message:
          "You have successfully logged in to your Prime Way account.",

        type: "LOGIN",

        isRead: false,
      });
    } catch (notificationError) {
      // Notification failure should not prevent successful login.
      console.error(
        "Login notification error:",
        notificationError
      );
    }

    return NextResponse.json({
      message: "Login successful",
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);

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