"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Commission = {
  id: string;
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
  bonuses: {
    totalPaisa: number;
    level1Paisa: number;
    level2Paisa: number;
  };
  commissions: Commission[];
};

export default function ReferralBonusPage() {
  const [data, setData] = useState<ReferralResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBonuses() {
      try {
        setLoading(true);

        const response = await fetch("/api/referrals", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Failed to load referral bonuses"
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#173b20]">
          Referral Bonus
        </h1>

        <p className="mt-1 text-sm text-[#6b7d6e]">
          Track commissions earned from your referral network.
        </p>
      </div>

      {/* Bonus Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <BonusCard
          title="Total Referral Bonus"
          amount={formatPKR(data.bonuses.totalPaisa)}
          icon={<Award className="h-5 w-5" />}
        />

        <BonusCard
          title="Level 1 Bonus"
          amount={formatPKR(data.bonuses.level1Paisa)}
          icon={<Users className="h-5 w-5" />}
        />

        <BonusCard
          title="Level 2 Bonus"
          amount={formatPKR(data.bonuses.level2Paisa)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[#173b20]">
          How referral bonuses work
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#e1efe2] bg-[#f5faf5] p-4">
            <p className="font-medium text-[#173b20]">
              Level 1
            </p>

            <p className="mt-1 text-sm text-[#6b7d6e]">
              You earn the configured Level 1 commission when a
              directly referred user makes an active investment.
            </p>
          </div>

          <div className="rounded-xl border border-[#e1efe2] bg-[#f5faf5] p-4">
            <p className="font-medium text-[#173b20]">
              Level 2
            </p>

            <p className="mt-1 text-sm text-[#6b7d6e]">
              You earn the configured Level 2 commission when a
              Level 2 user makes an active investment.
            </p>
          </div>
        </div>
      </div>

      {/* Commission History */}
      <div className="overflow-hidden rounded-2xl border border-[#dceedd] bg-white shadow-sm">
        <div className="border-b border-[#e5eee5] p-5">
          <h2 className="text-lg font-semibold text-[#173b20]">
            Bonus History
          </h2>

          <p className="mt-1 text-sm text-[#6b7d6e]">
            Your referral commission transactions.
          </p>
        </div>

        {data.commissions.length === 0 ? (
          <div className="p-10 text-center">
            <Award className="mx-auto h-10 w-10 text-[#9acb9d]" />

            <p className="mt-3 font-medium text-[#365a3a]">
              No referral bonuses yet
            </p>

            <p className="mt-1 text-sm text-[#708272]">
              Your commissions will appear here after eligible
              investments are activated.
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
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#58705b]">
                      Level
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
                  {data.commissions.map((commission) => (
                    <tr
                      key={commission.id}
                      className="transition hover:bg-[#f8fcf8]"
                    >
                      <td className="px-5 py-4">
                        {commission.sourceUser ? (
                          <>
                            <p className="font-medium text-[#173b20]">
                              {commission.sourceUser.fullName}
                            </p>

                            <p className="text-xs text-[#718273]">
                              @{commission.sourceUser.username}
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
                          Level {commission.level}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#536455]">
                        {formatPKR(commission.baseAmountPaisa)}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#536455]">
                        {formatPercentage(
                          commission.commissionRateBps
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#45a94a]">
                        +{formatPKR(commission.commissionAmountPaisa)}
                      </td>

                      <td className="px-5 py-4 text-sm text-[#718273]">
                        {new Date(
                          commission.createdAt
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-[#edf3ed] md:hidden">
              {data.commissions.map((commission) => (
                <div key={commission.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#173b20]">
                        {commission.sourceUser?.fullName ||
                          "User unavailable"}
                      </p>

                      {commission.sourceUser && (
                        <p className="text-xs text-[#718273]">
                          @{commission.sourceUser.username}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full border border-[#cfe7d1] bg-[#eff8f0] px-3 py-1 text-xs font-medium text-[#2f7d32]">
                      Level {commission.level}
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
                        +{formatPKR(
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
              ))}
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

      <p className="mt-4 text-sm text-[#6b7d6e]">{title}</p>

      <p className="mt-1 text-2xl font-bold text-[#173b20]">
        {amount}
      </p>
    </div>
  );
}