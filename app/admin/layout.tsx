import { redirect } from "next/navigation";

import { getSession } from "@/src/lib/auth";
import AdminSidebar from "@/src/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f7f7ff]">
      <AdminSidebar />

      <div className="min-h-screen lg:pl-[250px]">
        {children}
      </div>
    </div>
  );
}