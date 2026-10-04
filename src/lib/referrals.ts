const DEFAULT_LEVEL_1_BONUS_BPS = 1300; // 13%
const DEFAULT_LEVEL_2_BONUS_BPS = 500; // 5%

const LEVEL_1 = 1;
const LEVEL_2 = 2;

export async function createReferralCommissions(
  tx: any,
  sourceUserId: string,
  investmentId: string,
  investmentAmountPaisa: number
) {
  /**
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

  /**
   * The user was not referred by anyone.
   */
  if (!referral) {
    return;
  }

  /**
   * ------------------------------------------------------------
   * Find the referrer.
   * ------------------------------------------------------------
   */
  const receiver = await tx.orm.public.User.first({
    id: referral.referrerId,
  });

  if (!receiver) {
    return;
  }

  /**
   * ------------------------------------------------------------
   * Prevent duplicate commission for the same investment.
   *
   * This check is done before calculating/crediting anything.
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

  /**
   * ------------------------------------------------------------
   * Get current referral bonus settings.
   *
   * Values are stored as basis points:
   *
   * 13% = 1300
   * 5%  = 500
   * 25% = 2500
   * 20% = 2000
   *
   * If the settings row does not exist yet, use the defaults.
   * ------------------------------------------------------------
   */
  const referralSettings =
    await tx.orm.public.ReferralSetting.first({
      id: "default",
    });

  const level1BonusBps =
    referralSettings?.level1BonusBps ??
    DEFAULT_LEVEL_1_BONUS_BPS;

  const level2BonusBps =
    referralSettings?.level2BonusBps ??
    DEFAULT_LEVEL_2_BONUS_BPS;

  /**
   * ------------------------------------------------------------
   * Determine the referrer's current referral level.
   *
   * Every user starts at Level 1.
   *
   * Level 1 -> configured Level 1 bonus
   * Level 2 -> configured Level 2 bonus
   *
   * Once a user earns their first successful referral
   * commission, they are permanently upgraded to Level 2.
   * ------------------------------------------------------------
   */
  const currentReferralLevel =
    receiver.referralLevel === LEVEL_2
      ? LEVEL_2
      : LEVEL_1;

  const commissionRateBps =
    currentReferralLevel === LEVEL_1
      ? level1BonusBps
      : level2BonusBps;

  /**
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

  /**
   * ------------------------------------------------------------
   * Credit commission.
   * ------------------------------------------------------------
   */
  const balanceBefore = receiver.balancePaisa;

  const balanceAfter =
    balanceBefore + commissionAmountPaisa;

  /**
   * If the referrer is Level 1:
   *
   * 1. Give them the configured Level 1 commission.
   * 2. Upgrade them to Level 2.
   *
   * If already Level 2:
   * They remain Level 2.
   */
  const nextReferralLevel =
    currentReferralLevel === LEVEL_1
      ? LEVEL_2
      : LEVEL_2;

  await tx.orm.public.User
    .where({
      id: receiver.id,
    })
    .update({
      balancePaisa: balanceAfter,
      totalReferralPaisa:
        receiver.totalReferralPaisa +
        commissionAmountPaisa,
      referralLevel: nextReferralLevel,
    });

  /**
   * ------------------------------------------------------------
   * Create transaction ledger entry.
   *
   * "level" means the referrer's OWN level at the
   * time this commission was earned.
   * ------------------------------------------------------------
   */
  const transaction =
    await tx.orm.public.Transaction.create({
      userId: receiver.id,
      type: "REFERRAL_COMMISSION",
      amountPaisa: commissionAmountPaisa,
      balanceBeforePaisa: balanceBefore,
      balanceAfterPaisa: balanceAfter,
      referenceId: investmentId,
      description: `Level ${currentReferralLevel} referral commission (${commissionRateBps / 100}%)`,
      investmentId,
    });

  /**
   * ------------------------------------------------------------
   * Save commission record.
   *
   * commissionRateBps is stored permanently, so changing the
   * admin settings later will NOT modify historical commissions.
   * ------------------------------------------------------------
   */
  await tx.orm.public.ReferralCommission.create({
    receiverId: receiver.id,
    sourceUserId,
    investmentId,

    // Referrer's OWN level when commission was generated.
    level: currentReferralLevel,

    baseAmountPaisa: investmentAmountPaisa,
    commissionRateBps,
    commissionAmountPaisa,
    transactionId: transaction.id,
  });
}