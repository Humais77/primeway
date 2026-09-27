import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const notification =
      await db.orm.public.Notification.first({
        id,
      });

    if (!notification) {
      return NextResponse.json(
        {
          message: "Notification not found.",
        },
        { status: 404 }
      );
    }

    // Important: users can only modify their own notifications.
    if (notification.userId !== session.userId) {
      return NextResponse.json(
        {
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    const updated =
      await db.orm.public.Notification
        .where({
          id,
        })
        .update({
          isRead: true,
        });

    return NextResponse.json({
      notification: updated,
    });
  } catch (error) {
    console.error(
      "Notification PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to update notification.",
      },
      { status: 500 }
    );
  }
}