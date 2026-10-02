import { redirect } from "next/navigation";

import { getSession } from "@/src/lib/auth";

type InvestRedirectPageProps = {
  searchParams: Promise<{
    planId?: string;
  }>;
};

export default async function InvestRedirectPage({
  searchParams,
}: InvestRedirectPageProps) {
  const session = await getSession();
  const params = await searchParams;

  if (!session) {
    redirect("/login");
  }

  if (!params.planId) {
    redirect("/dashboard/invest-plan");
  }

  redirect(
    `/dashboard/deposit?planId=${encodeURIComponent(params.planId)}`
  );
}