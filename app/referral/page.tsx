import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Network,
  Share2,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { LandingHeader } from "@/src/components/landing/LandingHeader";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

export const metadata = {
  title: "Referral Program",
  description:
    "Learn how the Grow Vest referral program helps you grow your network and track referral activity.",
};

export default function ReferralPage() {
  return (
    <main className="min-h-screen bg-[#f7fbf7]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#03291d]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-[#16a34a]/20 blur-[110px]" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#45a94a]/10 blur-[120px]" />
        </div>

        <LandingHeader />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-36 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70e990]">
              Referral Program
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Grow Your Network.
              <br />
              <span className="text-[#70e990]">Grow Together.</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              Invite people to Grow Vest, build your network and track your
              referral activity directly from your account.
            </p>

            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#45d86a] to-[#16a34a] px-6 py-3 text-sm font-bold text-white shadow-xl shadow-green-950/20 transition hover:-translate-y-0.5"
            >
              Start Your Network
              <ArrowRight size={17} />
            </Link>
          </div>

          <ReferralNetwork />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
            How It Works
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#173b20] sm:text-4xl">
            Simple Steps to Get Started
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Step
            number="01"
            icon={<UserPlus size={21} />}
            title="Create Your Account"
            text="Register for your Grow Vest account and access your personal dashboard."
          />

          <Step
            number="02"
            icon={<Share2 size={21} />}
            title="Share Your Referral"
            text="Use your referral information to invite people to join the platform."
          />

          <Step
            number="03"
            icon={<TrendingUp size={21} />}
            title="Track Your Network"
            text="Monitor your referral activity and network directly from your dashboard."
          />
        </div>
      </section>

      {/* Network */}
      <section className="border-y border-[#dceedd] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-20">
          <div className="rounded-[30px] bg-[#eff8f0] p-7 sm:p-9">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#45a94a] shadow-sm">
              <Network size={23} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-[#173b20]">
              Your Network at a Glance
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Grow Vest gives you a dedicated area where you can keep track of
              your referral network and activity.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-[10px] uppercase text-gray-400">
                  Level 1
                </p>
                <p className="mt-1 text-2xl font-black text-[#173b20]">12</p>
                <p className="text-[10px] text-gray-400">Direct referrals</p>
              </div>

              <div className="rounded-2xl bg-white p-4">
                <p className="text-[10px] uppercase text-gray-400">
                  Level 2
                </p>
                <p className="mt-1 text-2xl font-black text-[#173b20]">28</p>
                <p className="text-[10px] text-gray-400">Indirect referrals</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2f8f45]">
              Referral Benefits
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#173b20] sm:text-4xl">
              Build Together, Grow Together
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-500">
              The referral system is designed to make it easy to understand
              your network and keep track of referral-related activity.
            </p>

            <div className="mt-7 space-y-5">
              <Benefit
                icon={<Users size={19} />}
                title="Build Your Network"
                text="Invite people and create your own growing network."
              />

              <Benefit
                icon={<Gift size={19} />}
                title="Referral Rewards"
                text="Review the referral benefits associated with your available plans."
              />

              <Benefit
                icon={<TrendingUp size={19} />}
                title="Track Progress"
                text="Monitor your direct and indirect referral activity."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl rounded-[32px] bg-gradient-to-r from-[#1f7a3a] via-[#45a94a] to-[#2f7d32] px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-black sm:text-4xl">
            Ready to Start Growing?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/65">
            Create your account and start building your Grow Vest network.
          </p>

          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#2f7d32] transition hover:bg-[#f1fff3]"
          >
            Create Account
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function ReferralNetwork() {
  return (
    <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center">
      <div className="absolute h-56 w-56 rounded-full bg-[#45a94a]/10 blur-3xl" />

      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#45a94a]/30 bg-white text-[#2f8f45] shadow-2xl">
        <Users size={35} />
      </div>

      <div className="absolute left-2 top-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#03291d] bg-[#45a94a] text-white shadow-xl">
        <UserPlus size={22} />
      </div>

      <div className="absolute right-2 top-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#03291d] bg-[#2f7d32] text-white shadow-xl">
        <Users size={22} />
      </div>

      <div className="absolute bottom-1 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#03291d] bg-[#15803d] text-white shadow-xl">
        <TrendingUp size={22} />
      </div>

      <div className="absolute left-20 top-16 h-px w-24 rotate-[24deg] bg-[#70e990]/50" />
      <div className="absolute right-20 top-16 h-px w-24 -rotate-[24deg] bg-[#70e990]/50" />
      <div className="absolute bottom-16 left-1/2 h-12 w-px bg-[#70e990]/50" />
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-[26px] border border-[#dceedd] bg-white p-7 shadow-sm">
      <span className="text-xs font-black text-[#45a94a]">{number}</span>

      <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black text-[#173b20]">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-gray-500">{text}</p>
    </div>
  );
}

function Benefit({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a]">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#173b20]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-gray-500">{text}</p>
      </div>
    </div>
  );
}