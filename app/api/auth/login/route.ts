import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/src/prisma/db";
import { createSession } from "@/src/lib/auth";

const LoginSchema = z.object({
  username: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = LoginSchema.parse(body);

    const loginInput = data.username.trim().toLowerCase();

    // Automatically detect whether the user entered an email or username.
    const isEmail = z.string().email().safeParse(loginInput).success;

    // Find the account using the appropriate database field.
    const user = isEmail
      ? await db.orm.public.User.first({ email: loginInput })
      : await db.orm.public.User.first({ username: loginInput });

    // Temporary debugging: never log passwords or password hashes.
    console.log("[LOGIN DEBUG] Login type:", isEmail ? "email" : "username");
    console.log("[LOGIN DEBUG] User found:", Boolean(user));

    if (!user) {
      return NextResponse.json(
        { message: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    // Email verification is not required for login.
    if (!user.isActive) {
      return NextResponse.json(
        { message: "Your account is disabled." },
        { status: 403 }
      );
    }

    const validPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    console.log("[LOGIN DEBUG] Password matched:", validPassword);

    if (!validPassword) {
      return NextResponse.json(
        { message: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    await createSession({
      userId: user.id,
      role: user.role,
    });

    // A notification failure must not prevent login.
    try {
      await db.orm.public.Notification.create({
        user: (notificationUser) =>
          notificationUser.connect({ id: user.id }),
        title: "Login successful",
        message:
          "You have successfully logged in to your Grow Vest account.",
        type: "LOGIN",
        isRead: false,
      });
    } catch (notificationError) {
      console.error("Login notification error:", notificationError);
    }

    return NextResponse.json({
      message: "Login successful",
      role: user.role,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Enter a valid username or email and password.",
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
