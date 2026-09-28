import { redirect } from "next/navigation";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";

import TransactionHistory from "@/src/components/dashboard/TransactionHistory";

export default async function TransactionsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const transactions =
    await db.orm.public.Transaction
      .where({
        userId: session.userId,
      })
      .orderBy((transaction) =>
        transaction.createdAt.desc()
      )
      .all();

  const serializedTransactions =
    transactions.map(
      (transaction) => ({
        id: transaction.id,
        type: transaction.type,

        amountPaisa:
          transaction.amountPaisa,

        balanceBeforePaisa:
          transaction.balanceBeforePaisa,

        balanceAfterPaisa:
          transaction.balanceAfterPaisa,

        referenceId:
          transaction.referenceId,

        description:
          transaction.description,

        createdAt:
          transaction.createdAt,

        investmentId:
          transaction.investmentId,

        depositId:
          transaction.depositId,

        withdrawalId:
          transaction.withdrawalId,
      })
    );

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-600">
              Account Activity
            </p>

           

           
          </div>
        </div>

        <TransactionHistory
          initialTransactions={
            serializedTransactions
          }
        />
      </div>
    </main>
  );
}