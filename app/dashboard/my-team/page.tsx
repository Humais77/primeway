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
          <Loader2 className="h-5 w-5 animate-spin" />
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
        <h1 className="text-2xl font-bold text-slate-900">
          My Team
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your Level 1 and Level 2 referral network.
        </p>
      </div>

      {/* Referral Code */}
      <div className="rounded-2xl bg-[#06141f] p-5 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-300">
              Your Referral Code
            </p>

            <p className="mt-1 text-2xl font-bold tracking-wider">
              {data.referralCode}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Share this code with people you want to refer.
            </p>
          </div>

          <button
            onClick={copyReferralCode}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#16c784] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
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
        description="Users referred by your Level 1 team members."
        members={data.team.level2}
        emptyMessage="No Level 2 referrals yet."
      />

      {/* Referral Bonus Link */}
      <Link
        href="/dashboard/referral-bonus"
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#16c784]"
      >
        <div>
          <h3 className="font-semibold text-slate-900">
            View Referral Bonuses
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Check your Level 1 and Level 2 commission history.
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-slate-400" />
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">
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
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700">
                  {member.fullName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-medium text-slate-900">
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