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
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
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
        <h1 className="text-2xl font-bold text-slate-900">
          Referral Bonus
        </h1>

        <p className="mt-1 text-sm text-slate-500">
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">
          How referral bonuses work
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-medium text-slate-900">
              Level 1
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You earn the configured Level 1 commission when a
              directly referred user makes an active investment.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-medium text-slate-900">
              Level 2
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You earn the configured Level 2 commission when a
              Level 2 user makes an active investment.
            </p>
          </div>
        </div>
      </div>

      {/* Commission History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Bonus History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your referral commission transactions.
          </p>
        </div>

        {data.commissions.length === 0 ? (
          <div className="p-10 text-center">
            <Award className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No referral bonuses yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your commissions will appear here after eligible
              investments are activated.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Level
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Investment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rate
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bonus
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td className="px-5 py-4">
                        {commission.sourceUser ? (
                          <>
                            <p className="font-medium text-slate-900">
                              {commission.sourceUser.fullName}
                            </p>

                            <p className="text-xs text-slate-500">
                              @{commission.sourceUser.username}
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-400">
                            User unavailable
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          Level {commission.level}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatPKR(commission.baseAmountPaisa)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatPercentage(
                          commission.commissionRateBps
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#16c784]">
                        +{formatPKR(commission.commissionAmountPaisa)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
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
            <div className="divide-y divide-slate-100 md:hidden">
              {data.commissions.map((commission) => (
                <div key={commission.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {commission.sourceUser?.fullName ||
                          "User unavailable"}
                      </p>

                      {commission.sourceUser && (
                        <p className="text-xs text-slate-500">
                          @{commission.sourceUser.username}
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      Level {commission.level}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Investment
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatPKR(
                          commission.baseAmountPaisa
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Rate
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatPercentage(
                          commission.commissionRateBps
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Bonus
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#16c784]">
                        +{formatPKR(
                          commission.commissionAmountPaisa
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Date
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {amount}
      </p>
    </div>
  );
}