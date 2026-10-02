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

    const user =
      await db.orm.public.User.first({
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
     * Get all referral relationships
     * belonging to the current user.
     */
    const referrals =
      await db.orm.public.Referral.where({
        referrerId: session.userId,
      }).all();

    /*
     * Direct referrals.
     */
    const level1Refs =
      referrals.filter(
        (referral: any) =>
          referral.level === 1
      );

    /*
     * Indirect referrals.
     */
    const level2Refs =
      referrals.filter(
        (referral: any) =>
          referral.level === 2
      );

    const level1 =
      await Promise.all(
        level1Refs.map(
          async (referral: any) => {
            const referredUser =
              await db.orm.public.User.first({
                id: referral.referredUserId,
              });

            if (!referredUser) {
              return null;
            }

            return {
              id: referredUser.id,

              fullName:
                referredUser.fullName,

              username:
                referredUser.username,

              createdAt:
                referral.createdAt,

              relationshipLevel: 1,

              isActive:
                referredUser.isActive,
            };
          }
        )
      );

    const level2 =
      await Promise.all(
        level2Refs.map(
          async (referral: any) => {
            const referredUser =
              await db.orm.public.User.first({
                id: referral.referredUserId,
              });

            if (!referredUser) {
              return null;
            }

            return {
              id: referredUser.id,

              fullName:
                referredUser.fullName,

              username:
                referredUser.username,

              createdAt:
                referral.createdAt,

              relationshipLevel: 2,

              isActive:
                referredUser.isActive,
            };
          }
        )
      );

    /*
     * Get commissions received
     * by current user.
     */
    const commissions =
      await db.orm.public.ReferralCommission.where(
        {
          receiverId: session.userId,
        }
      ).all();

    const totalBonusPaisa =
      commissions.reduce(
        (
          total: number,
          commission: any
        ) =>
          total +
          commission.commissionAmountPaisa,
        0
      );

    const level1BonusPaisa =
      commissions
        .filter(
          (commission: any) =>
            commission.level === 1
        )
        .reduce(
          (
            total: number,
            commission: any
          ) =>
            total +
            commission.commissionAmountPaisa,
          0
        );

    const level2BonusPaisa =
      commissions
        .filter(
          (commission: any) =>
            commission.level === 2
        )
        .reduce(
          (
            total: number,
            commission: any
          ) =>
            total +
            commission.commissionAmountPaisa,
          0
        );

    const commissionHistory =
      await Promise.all(
        commissions.map(
          async (commission: any) => {
            const sourceUser =
              await db.orm.public.User.first({
                id: commission.sourceUserId,
              });

            return {
              id: commission.id,

              level: commission.level,

              baseAmountPaisa:
                commission.baseAmountPaisa,

              commissionRateBps:
                commission.commissionRateBps,

              commissionAmountPaisa:
                commission.commissionAmountPaisa,

              createdAt:
                commission.createdAt,

              sourceUser: sourceUser
                ? {
                    id: sourceUser.id,

                    fullName:
                      sourceUser.fullName,

                    username:
                      sourceUser.username,
                  }
                : null,
            };
          }
        )
      );

    return NextResponse.json({
      referralCode:
        user.referralCode,

      /*
       * User's OWN referral level.
       *
       * This is different from the relationship
       * level of team members.
       */
      referralLevel:
        user.referralLevel ?? 1,

      team: {
        level1:
          level1.filter(Boolean),

        level2:
          level2.filter(Boolean),

        level1Count:
          level1.filter(Boolean).length,

        level2Count:
          level2.filter(Boolean).length,

        totalCount:
          level1.filter(Boolean).length +
          level2.filter(Boolean).length,
      },

      bonuses: {
        totalPaisa:
          totalBonusPaisa,

        level1Paisa:
          level1BonusPaisa,

        level2Paisa:
          level2BonusPaisa,
      },

      commissions:
        commissionHistory,
    });
  } catch (error) {
    console.error(
      "Referral API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load referral data",
      },
      {
        status: 500,
      }
    );
  }
}