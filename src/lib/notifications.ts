import { db } from "@/src/prisma/db";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: string;
};

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