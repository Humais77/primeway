import { db } from "@/src/prisma/db";
import InvestmentsAdmin from "@/src/components/admin/InvestmentsAdmin";

export default async function AdminInvestmentsPage() {
  const investments =
    await db.orm.public.Investment
      .include("user")
      .include("plan")
      .orderBy((investment) =>
        investment.createdAt.desc()
      )
      .all();

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#111b58]">
            Investments
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage user investment records,
            plans, profits and investment status.
          </p>
        </div>

        <InvestmentsAdmin
          initialInvestments={investments}
        />
      </div>
    </main>
  );
}