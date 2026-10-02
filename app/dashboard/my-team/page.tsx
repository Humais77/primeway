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
} from "lucide-react";

type TeamMember = {
  id: string;
  fullName: string;
  username: string;
  createdAt: string;
  level: number;
  isActive: boolean;
};

type ReferralResponse = {
  referralCode: string;
  team: {
    level1: TeamMember[];
    level2: TeamMember[];
    level1Count: number;
    level2Count: number;
    totalCount: number;
  };
};

export default function MyTeamPage() {
  const [data, setData] = useState<ReferralResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/referrals", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load team");
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
      await navigator.clipboard.writeText(data.referralCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy referral code");
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#173b20]">
          My Team
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View the users in your two-level referral network.
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

      {/* Referral Rule */}
      <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
            <Gift className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold text-[#173b20]">
              Referral Rewards
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Referral rewards are credited once for each eligible
              referred user. A user keeps the same referral level
              throughout the network.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Team"
          value={data.team.totalCount}
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Level 1"
          value={data.team.level1Count}
          icon={<UserPlus className="h-5 w-5" />}
        />

        <StatCard
          title="Level 2"
          value={data.team.level2Count}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Level 1 */}
      <TeamSection
        title="Level 1"
        description="Users who registered directly using your referral code."
        members={data.team.level1}
        emptyMessage="No Level 1 referrals yet."
      />

      {/* Level 2 */}
      <TeamSection
        title="Level 2"
        description="Users who registered using the referral code of your Level 1 members."
        members={data.team.level2}
        emptyMessage="No Level 2 referrals yet."
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
            View the one-time referral rewards you have earned.
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
                  {member.fullName.charAt(0).toUpperCase()}
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
                  {member.isActive ? "Active" : "Inactive"}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}