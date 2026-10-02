
import { redirect } from "next/navigation";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import DepositsAdmin from "@/src/components/admin/DepositsAdmin";

export default async function AdminDepositsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const deposits = await db.orm.public.Deposit
    .include("user")
    .include("plan")
    .include("paymentAccount")
    .orderBy((deposit) => deposit.createdAt.desc())
    .all();

  return (
    <main className="min-h-screen bg-[#f5f8f5] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <h1 className="text-3xl font-black text-[#173b20]">
            Deposits
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review and manage user payment requests.
          </p>
        </div>

        <DepositsAdmin
          initialDeposits={deposits as any}
        />
      </div>
    </main>
  );
}