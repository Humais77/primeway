import "dotenv/config";

import { db } from "../src/prisma/db";

const plans = [
  {
    name: "PRIME-01",
    amount: 590,
  },
  {
    name: "PRIME-02",
    amount: 1490,
  },
  {
    name: "PRIME-03",
    amount: 2490,
  },
  {
    name: "PRIME-04",
    amount: 3590,
  },
  {
    name: "PRIME-05",
    amount: 5390,
  },
  {
    name: "PRIME-06",
    amount: 7390,
  },
  {
    name: "PRIME-07",
    amount: 12990,
  },
  {
    name: "PRIME-08",
    amount: 23990,
  },
  {
    name: "PRIME-09",
    amount: 35990,
  },
  {
    name: "PRIME-10",
    amount: 48990,
  },
  {
    name: "PRIME-11",
    amount: 68990,
  },
  {
    name: "PRIME-12",
    amount: 96990,
  },
];

async function main() {
  const existing =
    await db.orm.public.InvestmentPlan.all();

  if (existing.length > 0) {
    console.log(
      `Investment plans already exist: ${existing.length}`
    );

    return;
  }

  const created =
    await db.orm.public.InvestmentPlan.createAll(
      plans.map((plan) => ({
        name: plan.name,

        minAmountPaisa:
          plan.amount * 100,

        maxAmountPaisa:
          plan.amount * 100,

        // 20%
        profitRateBps: 2000,

        // 14%
        referralBonusBps: 1400,

        frequency: "DAILY",

        durationDays: 85,

        isActive: true,
      }))
    );

  console.log(
    `Created ${created.length} investment plans.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });