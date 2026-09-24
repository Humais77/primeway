import { redirect } from "next/navigation";

import { getSession } from "@/src/lib/auth";

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

  return (
    <div className="min-h-screen bg-[#f7f7ff]">
      {children}
    </div>
  );
}