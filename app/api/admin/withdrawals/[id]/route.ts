import { NextResponse } from "next/server";
import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const status = body.status;
    const rejectionReason = typeof body.rejectionReason === "string" ? body.rejectionReason.trim() : "";
    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ message: "Status must be APPROVED or REJECTED." }, { status: 400 });
    }
    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json({ message: "A rejection reason is required." }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const current = await tx.orm.public.Withdrawal.first({ id });
      if (!current) throw new Error("WITHDRAWAL_NOT_FOUND");

      // Atomically claim the request. Only the request that changes PENDING
      // to a terminal status is allowed to perform balance/accounting effects.
      const claimed = await tx.orm.public.Withdrawal.where({ id, status: "PENDING" }).update({
        status,
        reviewedBy: admin.userId,
        reviewedAt: new Date().toISOString(),
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        updatedAt: new Date().toISOString(),
      });
      if (!claimed) throw new Error("WITHDRAWAL_ALREADY_PROCESSED");

      const user = await tx.orm.public.User.first({ id: current.userId });
      if (!user) throw new Error("USER_NOT_FOUND");

      if (status === "APPROVED") {
        await tx.orm.public.User.where({ id: user.id }).update({
          totalWithdrawnPaisa: user.totalWithdrawnPaisa + current.amountPaisa,
          updatedAt: new Date().toISOString(),
        });
        // Do not create a second WITHDRAWAL ledger row here. The submission
        // already records the reserved balance and references this withdrawal.
        await tx.orm.public.Notification.create({
          userId: user.id,
          title: "Withdrawal approved",
          message: `Your withdrawal of Rs ${(current.amountPaisa / 100).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been approved.`,
          type: "SUCCESS",
          isRead: false,
        });
        await tx.orm.public.Notification.create({
          userId: admin.userId,
          title: "Withdrawal approved",
          message: `Withdrawal ${current.id} was approved successfully.`,
          type: "INFO",
          isRead: false,
        });
      } else {
        // The request reserved funds on submission. Return them once on rejection;
        // totalWithdrawnPaisa is only incremented after approval, so do not reduce it.
        await tx.orm.public.User.where({ id: user.id }).update({
          balancePaisa: user.balancePaisa + current.amountPaisa,
          updatedAt: new Date().toISOString(),
        });
        await tx.orm.public.Transaction.create({
          userId: user.id,
          type: "REFUND",
          amountPaisa: current.amountPaisa,
          balanceBeforePaisa: user.balancePaisa,
          balanceAfterPaisa: user.balancePaisa + current.amountPaisa,
          referenceId: current.id,
          withdrawalId: current.id,
          description: `Refund for rejected withdrawal: ${rejectionReason}`,
        });
        await tx.orm.public.Notification.create({
          userId: user.id,
          title: "Withdrawal rejected",
          message: `Your withdrawal was rejected. Reason: ${rejectionReason}. The reserved amount has been returned to your balance.`,
          type: "WARNING",
          isRead: false,
        });
        await tx.orm.public.Notification.create({
          userId: admin.userId,
          title: "Withdrawal rejected",
          message: `Withdrawal ${current.id} was rejected and refunded.`,
          type: "INFO",
          isRead: false,
        });
      }
      return { status, withdrawalId: current.id };
    });

    return NextResponse.json({ message: `Withdrawal ${result.status.toLowerCase()} successfully.`, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "WITHDRAWAL_NOT_FOUND") return NextResponse.json({ message: "Withdrawal not found." }, { status: 404 });
    if (message === "WITHDRAWAL_ALREADY_PROCESSED") return NextResponse.json({ message: "This withdrawal has already been processed. Refresh the list to see its latest status." }, { status: 409 });
    if (message === "USER_NOT_FOUND") return NextResponse.json({ message: "User not found." }, { status: 404 });
    console.error("Admin withdrawal PATCH error:", error);
    return NextResponse.json({ message: "Unable to process withdrawal." }, { status: 500 });
  }
}
