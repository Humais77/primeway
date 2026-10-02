import { redirect } from "next/navigation";

import { getSession } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import PaymentAccountsAdmin from "@/src/components/admin/PaymentAccountsAdmin";

export default async function PaymentAccountsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const accounts = await db.orm.public.PaymentAccount
    .orderBy((account) => account.createdAt.desc())
    .all();

  return (
    <main className="min-h-screen bg-[#f5f8f5] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h1 className="text-3xl font-black text-[#173b20]">
            Payment Accounts
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage EasyPaisa, bank and Raast payment accounts.
          </p>
        </div>

        <PaymentAccountsAdmin
          initialAccounts={accounts as any}
        />
      </div>
    </main>
  );
}