const LEVEL_1_BONUS_BPS = 1300; // 13%
const LEVEL_2_BONUS_BPS = 500;  // 5%

const LEVEL_1 = 1;
const LEVEL_2 = 2;

export async function createReferralCommissions(
  tx: any,
  sourceUserId: string,
  investmentId: string,
  investmentAmountPaisa: number
) {
  /*
   * ------------------------------------------------------------
   * Find the direct referrer of the user who invested.
   *
   * Every referral relationship is DIRECT.
   * Referral.level should always be 1.
   * The referrer's OWN referralLevel determines the commission.
   * ------------------------------------------------------------
   */

  const referral = await tx.orm.public.Referral.first({
    referredUserId: sourceUserId,
  });

  /*
   * The user was not referred by anyone.
   */
  if (!referral) {
    return;
  }

  /*
   * Find the referrer.
   */
  const receiver = await tx.orm.public.User.first({
    id: referral.referrerId,
  });

  if (!receiver) {
    return;
  }

  /*
   * ------------------------------------------------------------
   * Determine the referrer's current referral level.
   *
   * Every user starts at Level 1.
   *
   * Level 1 = 13%
   * Level 2 = 5%
   * ------------------------------------------------------------
   */

  const currentReferralLevel =
    receiver.referralLevel === LEVEL_2
      ? LEVEL_2
      : LEVEL_1;

  const commissionRateBps =
    currentReferralLevel === LEVEL_1
      ? LEVEL_1_BONUS_BPS
      : LEVEL_2_BONUS_BPS;

  /*
   * ------------------------------------------------------------
   * Calculate commission.
   * ------------------------------------------------------------
   */

  const commissionAmountPaisa = Math.floor(
    (investmentAmountPaisa * commissionRateBps) /
      10_000
  );

  if (commissionAmountPaisa <= 0) {
    return;
  }

  /*
   * ------------------------------------------------------------
   * Prevent duplicate commission for the same investment.
   * ------------------------------------------------------------
   */

  const existingCommission =
    await tx.orm.public.ReferralCommission.first({
      investmentId,
      receiverId: receiver.id,
    });

  if (existingCommission) {
    return;
  }

  /*
   * ------------------------------------------------------------
   * Credit commission.
   * ------------------------------------------------------------
   */

  const balanceBefore =
    receiver.balancePaisa;

  const balanceAfter =
    balanceBefore +
    commissionAmountPaisa;

  await tx.orm.public.User
    .where({
      id: receiver.id,
    })
    .update({
      balancePaisa: balanceAfter,

      totalReferralPaisa:
        receiver.totalReferralPaisa +
        commissionAmountPaisa,

      /*
       * IMPORTANT:
       *
       * If the referrer was Level 1, this is their
       * first successful referred investment.
       *
       * Give them the 13% commission first,
       * then upgrade them permanently to Level 2.
       *
       * If they are already Level 2, they stay Level 2.
       */
      referralLevel:
        currentReferralLevel === LEVEL_1
          ? LEVEL_2
          : LEVEL_2,
    });

  /*
   * ------------------------------------------------------------
   * Create transaction ledger entry.
   *
   * "level" here means the referrer's OWN level
   * at the time this commission was earned.
   * ------------------------------------------------------------
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

      referenceId:
        investmentId,

      description:
        `Level ${currentReferralLevel} referral commission (${commissionRateBps / 100}%)`,

      investmentId,
    });

  /*
   * ------------------------------------------------------------
   * Save commission record.
   * ------------------------------------------------------------
   */

  await tx.orm.public.ReferralCommission.create({
    receiverId:
      receiver.id,

    sourceUserId,

    investmentId,

    /*
     * This is the referrer's OWN level when
     * the commission was generated.
     */
    level:
      currentReferralLevel,

    baseAmountPaisa:
      investmentAmountPaisa,

    commissionRateBps,

    commissionAmountPaisa,

    transactionId:
      transaction.id,
  });
}
