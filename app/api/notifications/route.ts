import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

export async function GET() {
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

    const notifications = await db.orm.public.Notification
      .where({
        userId: session.userId,
      })
      .orderBy((notification) =>
        notification.createdAt.desc()
      )
      .all();

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Notifications GET error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load notifications.",
      },
      { status: 500 }
    );
  }
}
export async function PATCH() {
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

    await db.orm.public.Notification
      .where({
        userId: session.userId,
        isRead: false,
      })
      .update({
        isRead: true,
      });

    return NextResponse.json({
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "Notifications mark-all-read error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to mark notifications as read.",
      },
      { status: 500 }
    );
  }
}