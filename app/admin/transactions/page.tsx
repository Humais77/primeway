import { redirect } from "next/navigation";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

import TransactionsAdmin from "@/src/components/admin/TransactionsAdmin";

export default async function AdminTransactionsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const transactions =
    await db.orm.public.Transaction
      .include("user")
      .include("investment")
      .include("deposit")
      .include("withdrawal")
      .orderBy((transaction) =>
        transaction.createdAt.desc()
      )
      .all();

  return (
    <main className="min-h-screen bg-[#f5f8f5] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h1 className="text-3xl font-black text-[#173b20]">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and monitor all platform transaction activity.
          </p>
        </div>

        <TransactionsAdmin
          initialTransactions={
            transactions as any
          }
        />
      </div>
    </main>
  );
}