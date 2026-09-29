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
    <main className="min-h-screen px-4 pb-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
    

        <TransactionHistory
          initialTransactions={
            serializedTransactions
          }
        />
      </div>
    </main>
  );
}