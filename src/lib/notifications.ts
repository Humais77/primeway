import { db } from "@/src/prisma/db";

type NotificationClient = typeof db;

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
};

/**
 * Create a notification using the normal database client.
 *
 * Use this outside a transaction.
 */
export async function createNotification({
  userId,
  title,
  message,
  type = "INFO",
}: CreateNotificationInput) {
  return db.orm.public.Notification.create({
    user: (user) => user.connect({ id: userId }),
    title,
    message,
    type,
  });
}
