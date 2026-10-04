"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Users,
  UserPlus,
  Copy,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  Gift,
  TrendingUp,
} from "lucide-react";

type TeamMember = {
  id: string;
  fullName: string;
  username: string;
  createdAt: string;
  relationshipLevel: number;
  isActive: boolean;
};

type ReferralResponse = {
  referralCode: string;

  referralLevel: number;

  team: {
    direct: TeamMember[];
    directCount: number;
    totalCount: number;
  };
};

export default function MyTeamPage() {
  const [data, setData] =
    useState<ReferralResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    async function loadTeam() {
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
              "Failed to load team"
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load referral team"
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, []);

  async function copyReferralCode() {
    if (!data?.referralCode) return;

    try {
      await navigator.clipboard.writeText(
        data.referralCode
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Unable to copy referral code"
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#18B152]" />

          Loading your team...
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
          My Team
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your direct referrals and track
          your referral level.
        </p>
      </div>

      {/* Referral Code */}
      <div className="rounded-2xl bg-gradient-to-br from-[#174d28] via-[#1f7a3a] to-[#2f7d32] p-5 text-white shadow-[0_8px_24px_rgba(45,100,50,0.14)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-green-100">
              Your Referral Code
            </p>

            <p className="mt-1 text-2xl font-bold tracking-wider">
              {data.referralCode}
            </p>

            <p className="mt-1 text-xs text-green-100/75">
              Share your code to invite new users.
            </p>
          </div>

          <button
            type="button"
            onClick={copyReferralCode}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#45a94a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#388e3c]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Referral Level */}
      <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-[#173b20]">
                Your Referral Level
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your commission rate is based on
                your own referral level.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#eff8f0] px-5 py-3 text-center">
            <p className="text-xs font-medium text-[#58705b]">
              Current Level
            </p>

            <p className="mt-1 text-xl font-bold text-[#2f7d32]">
              Level {referralLevel}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-xl border p-4 ${
              referralLevel === 1
                ? "border-[#b9dfbc] bg-[#f5faf5]"
                : "border-[#e1efe2] bg-white"
            }`}
          >
            <p className="font-semibold text-[#173b20]">
              Level 1
            </p>

            <p className="mt-1 text-sm text-slate-500">
              13% commission on your first
              successful referred investment.
            </p>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              referralLevel === 2
                ? "border-[#b9dfbc] bg-[#f5faf5]"
                : "border-[#e1efe2] bg-white"
            }`}
          >
            <p className="font-semibold text-[#173b20]">
              Level 2
            </p>

            <p className="mt-1 text-sm text-slate-500">
              5% commission on future successful
              referred investments.
            </p>
          </div>
        </div>
      </div>

      {/* Referral Rule */}
      <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
            <Gift className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-[#173b20]">
              How Referral Rewards Work
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Every user who registers directly using
              your referral code becomes part of your
              direct team. Referral commission is only
              credited after that user's investment is
              successfully approved.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your first successful referred investment
              earns you 13% and moves your referral level
              to Level 2. After that, successful referred
              investments earn you 5%.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Direct Referrals"
          value={data.team.totalCount}
          icon={
            <Users className="h-5 w-5" />
          }
        />

        <StatCard
          title="Current Referral Level"
          value={referralLevel}
          icon={
            <TrendingUp className="h-5 w-5" />
          }
        />
      </div>

      {/* Direct Team */}
      <TeamSection
        title="Direct Referrals"
        description="Users who registered directly using your referral code."
        members={data.team.direct}
        emptyMessage="No direct referrals yet."
      />

      {/* Referral Bonus Link */}
      <Link
        href="/dashboard/referral-bonus"
        className="flex items-center justify-between rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm transition hover:border-[#45a94a] hover:bg-[#f7fbf7]"
      >
        <div>
          <h3 className="font-semibold text-[#173b20]">
            View Referral Bonuses
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            View your 13% and 5% referral commissions.
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-[#45a94a]" />
      </Link>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-[#eff8f0] p-3 text-[#45a94a]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-[#173b20]">
        {value}
      </p>
    </div>
  );
}

function TeamSection({
  title,
  description,
  members,
  emptyMessage,
}: {
  title: string;
  description: string;
  members: TeamMember[];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dceedd] bg-white shadow-sm">
      <div className="border-b border-[#e5efe5] p-5">
        <h2 className="text-lg font-semibold text-[#173b20]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {members.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-[#edf3ed]">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff8f0] font-semibold text-[#2f7d32]">
                  {member.fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="font-medium text-[#173b20]">
                    {member.fullName}
                  </p>

                  <p className="text-sm text-slate-500">
                    @{member.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    member.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {member.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(
                    member.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}