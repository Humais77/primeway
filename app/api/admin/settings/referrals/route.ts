import { NextResponse } from "next/server";

import { db } from "@/src/prisma/db";
import { requireAdmin } from "@/src/lib/admin";

const DEFAULT_LEVEL_1_BPS = 1300; // 13%
const DEFAULT_LEVEL_2_BPS = 500; // 5%

function percentageToBps(value: unknown) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  if (value < 0 || value > 100) {
    return null;
  }

  return Math.round(value * 100);
}

function bpsToPercentage(bps: number) {
  return bps / 100;
}

/*
 * =========================================================
 * GET
 * =========================================================
 *
 * Returns the current referral commission settings.
 */

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    let setting =
      await db.orm.public.ReferralSetting.first();

    /*
     * Create default settings if this is the first time
     * the admin opens referral settings.
     */

    if (!setting) {
      setting =
        await db.orm.public.ReferralSetting.create({
          id: "default",

          level1BonusBps:
            DEFAULT_LEVEL_1_BPS,

          level2BonusBps:
            DEFAULT_LEVEL_2_BPS,
        });
    }

    return NextResponse.json({
      settings: {
        level1BonusBps:
          setting.level1BonusBps,

        level2BonusBps:
          setting.level2BonusBps,

        level1Percentage:
          bpsToPercentage(
            setting.level1BonusBps
          ),

        level2Percentage:
          bpsToPercentage(
            setting.level2BonusBps
          ),

        updatedAt:
          setting.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Admin referral settings GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load referral settings.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =========================================================
 * PATCH
 * =========================================================
 *
 * Admin can update:
 *
 * {
 *   "level1Percentage": 20,
 *   "level2Percentage": 5
 * }
 *
 * Percentages are converted to BPS before saving.
 */

export async function PATCH(
  request: Request
) {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<string, unknown>;

    const level1Percentage =
      data.level1Percentage;

    const level2Percentage =
      data.level2Percentage;

    const level1Bps =
      percentageToBps(
        level1Percentage
      );

    const level2Bps =
      percentageToBps(
        level2Percentage
      );

    if (level1Bps === null) {
      return NextResponse.json(
        {
          message:
            "Level 1 percentage must be a number between 0 and 100.",
        },
        {
          status: 400,
        }
      );
    }

    if (level2Bps === null) {
      return NextResponse.json(
        {
          message:
            "Level 2 percentage must be a number between 0 and 100.",
        },
        {
          status: 400,
        }
      );
    }

    let setting =
      await db.orm.public.ReferralSetting.first();

    /*
     * Create the single default settings row if
     * it does not exist.
     */

    if (!setting) {
      setting =
        await db.orm.public.ReferralSetting.create({
          id: "default",

          level1BonusBps:
            level1Bps,

          level2BonusBps:
            level2Bps,
        });
    } else {
      setting =
        await db.orm.public.ReferralSetting
          .where({
            id: "default",
          })
          .update({
            level1BonusBps:
              level1Bps,

            level2BonusBps:
              level2Bps,

            updatedAt:
              new Date().toISOString(),
          });
    }

    if (!setting) {
  throw new Error("Failed to create referral settings.");
}

    return NextResponse.json({
      message:
        "Referral commission settings updated successfully.",

      settings: {
        level1BonusBps:
          setting.level1BonusBps,

        level2BonusBps:
          setting.level2BonusBps,

        level1Percentage:
          bpsToPercentage(
            setting.level1BonusBps
          ),

        level2Percentage:
          bpsToPercentage(
            setting.level2BonusBps
          ),

        updatedAt:
          setting.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Admin referral settings PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to update referral settings.",
      },
      {
        status: 500,
      }
    );
  }
}