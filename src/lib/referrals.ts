export async function createReferralCommissions(
  tx: any,
  sourceUserId: string,
  investmentId: string,
  investmentAmountPaisa: number
) {
  /*
   * Get referral settings.
   */
  let referralSetting =
    await tx.orm.public.ReferralSetting.first();

  /*
   * Create default settings if they don't exist.
   */
  if (!referralSetting) {
    referralSetting =
      await tx.orm.public.ReferralSetting.create({
        id: "default",
        level1BonusBps: 1300, // 13%
        level2BonusBps: 500,  // 5%
      });
  }

  /*
   * Get Level 1 + Level 2 relationships
   * for the user who made the investment.
   */
  const referrals =
    await tx.orm.public.Referral
      .where({
        referredUserId: sourceUserId,
      })
      .all();

  for (const referral of referrals) {
    const rate =
      referral.level === 1
        ? referralSetting.level1BonusBps
        : referral.level === 2
          ? referralSetting.level2BonusBps
          : 0;

    if (rate <= 0) {
      continue;
    }

    /*
     * Calculate commission.
     *
     * BPS:
     * 1300 = 13%
     * 500  = 5%
     */
    const commissionAmountPaisa =
      Math.floor(
        (investmentAmountPaisa * rate) /
          10000
      );

    if (commissionAmountPaisa <= 0) {
      continue;
    }

    /*
     * Safety check:
     * never pay the same level twice
     * for the same investment.
     */
    const existing =
      await tx.orm.public.ReferralCommission.first(
        {
          investmentId,
          level: referral.level,
        }
      );

    if (existing) {
      continue;
    }

    const receiver =
      await tx.orm.public.User.first({
        id: referral.referrerId,
      });

    if (!receiver) {
      continue;
    }

    const balanceBefore =
      receiver.balancePaisa;

    const balanceAfter =
      balanceBefore +
      commissionAmountPaisa;

    /*
     * Credit commission to receiver.
     */
    await tx.orm.public.User
      .where({
        id: receiver.id,
      })
      .update({
        balancePaisa: balanceAfter,

        totalReferralPaisa:
          receiver.totalReferralPaisa +
          commissionAmountPaisa,
      });

    /*
     * Create transaction ledger entry.
     */
    const transaction =
      await tx.orm.public.Transaction.create({
        userId: receiver.id,

        type: "REFERRAL_COMMISSION",

        amountPaisa:
          commissionAmountPaisa,

        balanceBeforePaisa:
          balanceBefore,

        balanceAfterPaisa:
          balanceAfter,

        referenceId: investmentId,

        description:
          `Level ${referral.level} referral commission`,

        investmentId,
      });

    /*
     * Save commission record.
     */
    await tx.orm.public.ReferralCommission.create({
      receiverId: receiver.id,

      sourceUserId,

      investmentId,

      level: referral.level,

      baseAmountPaisa:
        investmentAmountPaisa,

      commissionRateBps:
        rate,

      commissionAmountPaisa,

      transactionId:
        transaction.id,
    });
  }
}