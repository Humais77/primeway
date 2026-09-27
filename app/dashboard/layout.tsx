import { redirect } from "next/navigation";

import { db } from "@/src/prisma/db";
import { getSession } from "@/src/lib/auth";
import { formatPKR } from "@/src/lib/money";

import { DashboardUIProvider } from "@/src/components/dashboard/DashboardUI";
import DashboardHeader from "@/src/components/dashboard/DashboardHeader";
import BottomNavigation from "@/src/components/dashboard/BottomNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "USER") {
    redirect("/admin");
  }

  const user = await db.orm.public.User.first({
    id: session.userId,
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardUIProvider
      fullName={user.fullName}
      userId={user.id}
    >
      <div className="min-h-screen bg-[#f7f7ff]">
        <DashboardHeader
          fullName={user.fullName}
          balanceStr={formatPKR(user.balancePaisa)}
        />

        {children}

        <BottomNavigation />
      </div>
    </DashboardUIProvider>
  );
}