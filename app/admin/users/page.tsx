import { db } from "@/src/prisma/db";
import UsersAdmin from "@/src/components/admin/UsersAdmin";

export default async function AdminUsersPage() {
  const users = await db.orm.public.User
    .orderBy((user) => user.createdAt.desc())
    .all();

  return (
    <main className="min-h-screen bg-[#f5f8f5] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#173b20]">
            Users
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage Prime Way user accounts, balances and account status.
          </p>
        </div>

        <UsersAdmin
          initialUsers={users}
        />
      </div>
    </main>
  );
}