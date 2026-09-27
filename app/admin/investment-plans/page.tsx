import { db } from "@/src/prisma/db";
import InvestmentPlansAdmin from "@/src/components/admin/InvestmentPlansAdmin";

export default async function AdminInvestmentPlansPage() {
  const plans =
    await db.orm.public.InvestmentPlan
      .orderBy((plan) =>
        plan.createdAt.asc()
      )
      .all();

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#111b58]">
            Investment Plans
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create, update, activate and manage
            Prime Way investment plans.
          </p>
        </div>

        <InvestmentPlansAdmin
          initialPlans={plans}
        />
      </div>
    </main>
  );
}