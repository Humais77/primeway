"use client";

import { useEffect, useState } from "react";

import {
  Award,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
  Gift,
} from "lucide-react";

type Commission = {
  id: string;

  /*
   * Referrer's own level when the commission
   * was earned.
   *
   * Level 1 = 13%
   * Level 2 = 5%
   */
  level: number;

  baseAmountPaisa: number;

  commissionRateBps: number;

  commissionAmountPaisa: number;

  createdAt: string;

  sourceUser: {
    id: string;
    fullName: string;
    username: string;
  } | null;
};

type ReferralResponse = {
  referralLevel: number;

  bonuses: {
    totalPaisa: number;
    level1Paisa: number;
    level2Paisa: number;
  };

  commissions: Commission[];
};

export default function ReferralBonusPage() {
  const [data, setData] =
    useState<ReferralResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadBonuses() {
      try {
        setLoading(true);

        setError("");

        const response = await fetch(
          "/api/referrals",
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load referral bonuses"
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load referral bonuses"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBonuses();
  }, []);

  function formatPKR(paisa: number) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(paisa / 100);
  }

  function formatPercentage(bps: number) {
    return `${(bps / 100).toFixed(2)}%`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-[#5f7562]">
          <Loader2 className="h-5 w-5 animate-spin text-[#45a94a]" />

          Loading referral bonuses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5" />

          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const referralLevel =
    data.referralLevel === 2
      ? 2
      : 1;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#173b20]">
          Referral Bonus
        </h1>

        <p className="mt-1 text-sm text-[#6b7d6e]">
          Track the referral commissions you earn
          from successful investments made by users
          you directly referred.
        </p>
      </div>

      {/* Current Level */}
      <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-[#173b20]">
                Your Current Referral Level
              </h2>

              <p className="mt-1 text-sm text-[#6b7d6e]">
                Your level determines the commission
                rate you receive from successful
                referred investments.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#eff8f0] px-6 py-3 text-center">
            <p className="text-xs font-medium text-[#58705b]">
              Current Level
            </p>

            <p className="mt-1 text-xl font-bold text-[#2f7d32]">
              Level {referralLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <BonusCard
          title="Total Referral Bonus"
          amount={formatPKR(
            data.bonuses.totalPaisa
          )}
          icon={
            <Award className="h-5 w-5" />
          }
        />

        <BonusCard
          title="Level 1 Bonus"
          amount={formatPKR(
            data.bonuses.level1Paisa
          )}
          icon={
            <Users className="h-5 w-5" />
          }
        />

        <BonusCard
          title="Level 2 Bonus"
          amount={formatPKR(
            data.bonuses.level2Paisa
          )}
          icon={
            <TrendingUp className="h-5 w-5" />
          }
        />
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
            <Gift className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-[#173b20]">
              How Referral Bonuses Work
            </h2>

            <p className="mt-1 text-sm leading-6 text-[#6b7d6e]">
              Referral bonuses are earned when a user
              you directly referred successfully invests
              and their investment is approved. No bonus
              is paid when the user only registers.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Level 1 */}
          <div
            className={`rounded-xl border p-4 ${
              referralLevel === 1
                ? "border-[#b9dfbc] bg-[#f5faf5]"
                : "border-[#e1efe2] bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#45a94a]" />

              <p className="font-medium text-[#173b20]">
                Level 1 — 13%
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#6b7d6e]">
              Every user starts at Level 1. When your
              first directly referred user makes a
              successful approved investment, you earn
              13% of that investment amount.
            </p>

            <p className="mt-2 text-xs font-medium text-[#45a94a]">
              After the first successful referral,
              you move to Level 2.
            </p>
          </div>

          {/* Level 2 */}
          <div
            className={`rounded-xl border p-4 ${
              referralLevel === 2
                ? "border-[#b9dfbc] bg-[#f5faf5]"
                : "border-[#e1efe2] bg-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#45a94a]" />

              <p className="font-medium text-[#173b20]">
                Level 2 — 5%
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#6b7d6e]">
              Once you reach Level 2, you remain at
              Level 2. Future successful investments
              made by users you directly referred earn
              you 5%.
            </p>

            <p className="mt-2 text-xs font-medium text-[#45a94a]">
              Level 2 is the maximum referral level.
            </p>
          </div>
        </div>

        {/* Example */}
        <div className="mt-5 rounded-xl border border-[#dceedd] bg-white p-4">
          <p className="text-sm font-semibold text-[#173b20]">
            Example
          </p>

          <div className="mt-3 space-y-3 text-sm text-[#6b7d6e]">
            <p>
              <span className="font-semibold text-[#173b20]">
                A → B:
              </span>{" "}
              B registers using A's referral code.
              No bonus is paid yet.
            </p>

            <p>
              <span className="font-semibold text-[#173b20]">
                B invests 590 PKR:
              </span>{" "}
              After approval, A earns 13% =
              <span className="font-semibold text-[#45a94a]">
                {" "}
                76.70 PKR
              </span>
              . A then becomes Level 2.
            </p>

            <p>
              <span className="font-semibold text-[#173b20]">
                C registers using A's code:
              </span>{" "}
              A remains Level 2.
            </p>

            <p>
              <span className="font-semibold text-[#173b20]">
                C invests 590 PKR:
              </span>{" "}
              After approval, A earns 5% =
              <span className="font-semibold text-[#45a94a]">
                {" "}
                29.50 PKR
              </span>
              .
            </p>

            <p>
              The same 5% Level 2 rate applies to
              future successful investments made by
              A's direct referrals.
            </p>
          </div>
        </div>
      </div>

      {/* Bonus History */}
      <div className="overflow-hidden rounded-2xl border border-[#dceedd] bg-white shadow-sm">
        <div className="border-b border-[#e5eee5] p-5">
          <h2 className="text-lg font-semibold text-[#173b20]">
            Bonus History
          </h2>

          <p className="mt-1 text-sm text-[#6b7d6e]">
            Each entry represents a commission earned
            from a successful referred investment.
          </p>
        </div>

        {data.commissions.length === 0 ? (
          <div className="p-10 text-center">
            <Award className="mx-auto h-10 w-10 text-[#9acb9d]" />

            <p className="mt-3 font-medium text-[#365a3a]">
              No referral bonuses yet
            </p>

            <p className="mt-1 text-sm text-[#708272]">
              Your referral commissions will appear
              here after a directly referred user's
              investment is approved.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b border-[#e5eee5] bg-[#f5faf5]">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Referred User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Commission Level
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Investment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Rate
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Bonus
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf3ed]">
                  {data.commissions.map(
                    (commission) => (
                      <tr
                        key={commission.id}
                        className="transition hover:bg-[#f8fcf8]"
                      >
                        <td className="px-5 py-4">
                          {commission.sourceUser ? (
                            <>
                              <p className="font-medium text-[#173b20]">
                                {
                                  commission
                                    .sourceUser
                                    .fullName
                                }
                              </p>

                              <p className="text-xs text-[#718273]">
                                @
                                {
                                  commission
                                    .sourceUser
                                    .username
                                }
                              </p>
                            </>
                          ) : (
                            <span className="text-[#9aa69c]">
                              User unavailable
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full border border-[#cfe7d1] bg-[#eff8f0] px-3 py-1 text-xs font-medium text-[#2f7d32]">
                            Level{" "}
                            {
                              commission.level
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#536455]">
                          {formatPKR(
                            commission.baseAmountPaisa
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#536455]">
                          {formatPercentage(
                            commission.commissionRateBps
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#45a94a]">
                          +
                          {formatPKR(
                            commission.commissionAmountPaisa
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-[#718273]">
                          {new Date(
                            commission.createdAt
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-[#edf3ed] md:hidden">
              {data.commissions.map(
                (commission) => (
                  <div
                    key={commission.id}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-[#173b20]">
                          {commission.sourceUser
                            ?.fullName ||
                            "User unavailable"}
                        </p>

                        {commission.sourceUser && (
                          <p className="text-xs text-[#718273]">
                            @
                            {
                              commission
                                .sourceUser
                                .username
                            }
                          </p>
                        )}
                      </div>

                      <span className="rounded-full border border-[#cfe7d1] bg-[#eff8f0] px-3 py-1 text-xs font-medium text-[#2f7d32]">
                        Level{" "}
                        {commission.level}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#edf2ed] bg-[#f8faf8] p-3">
                        <p className="text-xs text-[#718273]">
                          Investment
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#173b20]">
                          {formatPKR(
                            commission.baseAmountPaisa
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#edf2ed] bg-[#f8faf8] p-3">
                        <p className="text-xs text-[#718273]">
                          Rate
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#173b20]">
                          {formatPercentage(
                            commission.commissionRateBps
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#dceedd] bg-[#f2faf3] p-3">
                        <p className="text-xs text-[#718273]">
                          Bonus
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#45a94a]">
                          +
                          {formatPKR(
                            commission.commissionAmountPaisa
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#edf2ed] bg-[#f8faf8] p-3">
                        <p className="text-xs text-[#718273]">
                          Date
                        </p>

                        <p className="mt-1 text-sm text-[#536455]">
                          {new Date(
                            commission.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BonusCard({
  title,
  amount,
  icon,
}: {
  title: string;
  amount: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-[#eff8f0] p-3 text-[#45a94a]">
          {icon}
        </div>

        <div className="h-2 w-2 rounded-full bg-[#45a94a]" />
      </div>

      <p className="mt-4 text-sm text-[#6b7d6e]">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-[#173b20]">
        {amount}
      </p>
    </div>
  );
}