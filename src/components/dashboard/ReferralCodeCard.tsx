"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Share2, Users } from "lucide-react";

type Props = {
  referralCode: string;
  shareUrl?: string;
};

export default function ReferralCodeCard({
  referralCode,
  shareUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  const referralUrl =
    shareUrl ||
    `${
      typeof window !== "undefined"
        ? window.location.origin
        : "https://growvest.xyz"
    }/register?ref=${encodeURIComponent(referralCode)}`;

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      try {
        const input = document.createElement("input");

        input.value = referralUrl;
        document.body.appendChild(input);

        input.select();
        document.execCommand("copy");

        document.body.removeChild(input);

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch {
        // Nothing else to do
      }
    }
  };

  return (
    <section className="rounded-[22px] border border-[#DCEDE3] bg-white p-4 shadow-[0_6px_24px_rgba(15,61,46,0.05)] md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF8F0] text-[#18B152]">
            <Users size={17} />
          </span>

          <div>
            <h3 className="text-sm font-black text-[#0F3D2E]">
              Referral Program
            </h3>

            <p className="text-[11px] text-gray-500">
              Share your link and earn rewards
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/referral-bonus"
          className="hidden items-center gap-1 text-xs font-semibold text-[#18B152] transition hover:text-[#18613F] sm:flex"
        >
          Details
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Referral Code */}
      <div className="mt-3 rounded-xl border border-dashed border-[#A9D9BC] bg-[#F5FBF7] px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Your Referral Code
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <p className="truncate font-mono text-sm font-bold tracking-wider text-[#18613F]">
            {referralCode}
          </p>

          <button
            type="button"
            onClick={copyReferralLink}
            aria-label="Copy referral link"
            className="flex shrink-0 items-center gap-1 rounded-lg bg-[#18B152] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#18613F] active:scale-95"
          >
            {copied ? (
              <>
                <Check size={13} />
                Copied
              </>
            ) : (
              <>
                <Share2 size={13} />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Referral Link Preview */}
      <div className="mt-2 rounded-xl bg-[#F8FCF9] px-3 py-2">
        <p className="truncate text-[10px] text-gray-400">
          {referralUrl}
        </p>
      </div>
    </section>
  );
}