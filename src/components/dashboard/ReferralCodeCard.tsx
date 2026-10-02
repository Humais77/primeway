"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Users } from "lucide-react";

type Props = {
  referralCode: string;
  shareUrl?: string;
};

export default function ReferralCodeCard({
  referralCode,
  shareUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Optional fallback for browsers that block clipboard
      // outside HTTPS / user gesture contexts.
      try {
        const input = document.createElement("input");
        input.value = referralCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // swallow — nothing else we can do
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
              Share your code and earn rewards
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

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#A9D9BC] bg-[#F5FBF7] px-3 py-3">
        <p className="truncate font-mono text-sm font-bold tracking-wider text-[#18613F]">
          {referralCode}
        </p>

        <button
          type="button"
          onClick={copy}
          aria-label="Copy referral code"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#18B152] px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-[#18613F] active:scale-95"
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>
    </section>
  );
}