import { redirect } from "next/navigation";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import DepositUI from "@/src/components/dashboard/DepositUI";

type Props = {
  searchParams: Promise<{
    planId?: string;
    method?: string;
  }>;
};

export default async function DepositPage({
  searchParams,
}: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;

  let plan = null;

  if (params.planId) {
    plan =
      await db.orm.public.InvestmentPlan.first({
        id: params.planId,
        isActive: true,
      });
  }

  return (
     <main className="w-full px-4 pb-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <DepositUI
          plan={
            plan
              ? {
                  id: plan.id,
                  name: plan.name,
                  amountPaisa:
                    plan.minAmountPaisa,
                }
              : null
          }
          initialMethod={
            params.method || null
          }
        />
      </div>
    </main>
  );
}