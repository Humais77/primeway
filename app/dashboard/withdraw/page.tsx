import { redirect } from "next/navigation";

import { getSession } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";
import WithdrawForm from "@/src/components/dashboard/WithdrawForm";


export default async function WithdrawPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user =
    await db.orm.public.User.first({
      id: session.userId,
    });

  if (!user) {
    redirect("/login");
  }

  let setting =
    await db.orm.public.WithdrawalSetting
      .first();

  if (!setting) {
    setting =
      await db.orm.public.WithdrawalSetting.create(
        {
          minWithdrawalPaisa: 50000,
        }
      );
  }

  return (
    <main className="min-h-screen px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-24 lg:px-8 lg:pb-8 lg:pt-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
         

          <h1 className="text-3xl font-black text-[#111b58] md:text-4xl">
            Withdraw
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Request a withdrawal to your Easypaisa,
            bank or Raast account.
          </p>
        </div>

        <WithdrawForm
          balancePaisa={user.balancePaisa}
          minWithdrawalPaisa={
            setting.minWithdrawalPaisa
          }
        />
      </div>
    </main>
  );
}