import WithdrawalsAdmin from "@/src/components/admin/WithdrawalsAdmin";
import { db } from "@/src/prisma/db";

export default async function AdminWithdrawalsPage() {
  const withdrawals = await db.orm.public.Withdrawal
    .include("user")
    .include("reviewer")
    .orderBy((withdrawal) => withdrawal.createdAt.desc())
    .all();

  let setting =
    await db.orm.public.WithdrawalSetting.first();

  if (!setting) {
    setting =
      await db.orm.public.WithdrawalSetting.create({
        minWithdrawalPaisa: 50000,
      });
  }

  return (
    <main className="min-h-screen bg-[#f5f8f5] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#173b20]">
            Withdrawals
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage withdrawal requests and minimum withdrawal settings.
          </p>
        </div>

        <WithdrawalsAdmin
          initialWithdrawals={
            withdrawals as unknown as Parameters<
              typeof WithdrawalsAdmin
            >[0]["initialWithdrawals"]
          }
          initialMinWithdrawalPaisa={
            setting.minWithdrawalPaisa
          }
        />
      </div>
    </main>
  );
}