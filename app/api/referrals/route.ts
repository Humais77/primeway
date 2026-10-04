import { NextResponse } from "next/server";

import { getSession } from "@/src/lib/auth";
import { db } from "@/src/prisma/db";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user = await db.orm.public.User.first({
      id: session.userId,
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ------------------------------------------------
     * DIRECT REFERRALS
     * ------------------------------------------------
     *
     * Every referral relationship is direct.
     *
     * Referral.level is no longer used to determine
     * whether someone is Level 1 or Level 2.
     *
     * The user's own referralLevel determines the
     * commission rate they receive:
     *
     * Level 1 = 13%
     * Level 2 = 5%
     */
    const referrals = await db.orm.public.Referral.where({
      referrerId: session.userId,
    }).all();

    const team = await Promise.all(
      referrals.map(async (referral: any) => {
        const referredUser =
          await db.orm.public.User.first({
            id: referral.referredUserId,
          });

        if (!referredUser) {
          return null;
        }

        return {
          id: referredUser.id,

          fullName: referredUser.fullName,

          username: referredUser.username,

          createdAt: referral.createdAt,

          /*
           * Every relationship is a direct referral.
           */
          relationshipLevel: 1,

          isActive: referredUser.isActive,
        };
      })
    );

    const validTeam = team.filter(Boolean);

    /*
     * ------------------------------------------------
     * REFERRAL COMMISSIONS
     * ------------------------------------------------
     *
     * Commission.level represents the referrer's
     * own referral level at the time the commission
     * was earned.
     *
     * Level 1 = 13%
     * Level 2 = 5%
     */
    const commissions =
      await db.orm.public.ReferralCommission.where({
        receiverId: session.userId,
      }).all();

    const totalBonusPaisa = commissions.reduce(
      (total: number, commission: any) =>
        total + commission.commissionAmountPaisa,
      0
    );

    const level1BonusPaisa = commissions
      .filter(
        (commission: any) => commission.level === 1
      )
      .reduce(
        (total: number, commission: any) =>
          total + commission.commissionAmountPaisa,
        0
      );

    const level2BonusPaisa = commissions
      .filter(
        (commission: any) => commission.level === 2
      )
      .reduce(
        (total: number, commission: any) =>
          total + commission.commissionAmountPaisa,
        0
      );

    const commissionHistory = await Promise.all(
      commissions.map(async (commission: any) => {
        const sourceUser =
          await db.orm.public.User.first({
            id: commission.sourceUserId,
          });

        return {
          id: commission.id,

          /*
           * This is the referrer's own level when
           * this commission was earned.
           */
          level: commission.level,

          baseAmountPaisa:
            commission.baseAmountPaisa,

          commissionRateBps:
            commission.commissionRateBps,

          commissionAmountPaisa:
            commission.commissionAmountPaisa,

          createdAt: commission.createdAt,

          sourceUser: sourceUser
            ? {
                id: sourceUser.id,

                fullName: sourceUser.fullName,

                username: sourceUser.username,
              }
            : null,
        };
      })
    );

    /*
     * Sort newest commission first.
     */
    commissionHistory.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    /*
     * Sort newest team member first.
     */
    validTeam.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      referralCode: user.referralCode,

      /*
       * User's OWN referral level.
       *
       * 1 = has not yet completed their first
       *     successful referred investment.
       *
       * 2 = has already completed at least one
       *     successful referred investment.
       */
      referralLevel: user.referralLevel ?? 1,

      /*
       * All users who directly registered using
       * this user's referral code.
       */
      team: {
        direct: validTeam,

        directCount: validTeam.length,

        totalCount: validTeam.length,
      },

      /*
       * Referral commission totals.
       */
      bonuses: {
        totalPaisa: totalBonusPaisa,

        level1Paisa: level1BonusPaisa,

        level2Paisa: level2BonusPaisa,
      },

      commissions: commissionHistory,
    });
  } catch (error) {
    console.error(
      "Referral API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load referral data",
      },
      {
        status: 500,
      }
    );
  }
}