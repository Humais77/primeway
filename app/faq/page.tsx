import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

import { LandingHeader } from "@/src/components/landing/LandingHeader";
import { LandingFooter } from "@/src/components/landing/LandingFooter";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Grow Vest, investment plans, referrals and account management.",
};

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create a Grow Vest account?",
        answer:
          "Click the Sign Up button, complete the registration information and follow the account setup process. Once your account is ready, you can access your dashboard.",
      },
      {
        question: "How do I get started with investing?",
        answer:
          "Visit the Plans page to review the currently available investment plans. After choosing a suitable plan, you can continue through the account and investment process.",
      },
      {
        question: "Do I need an account before investing?",
        answer:
          "Yes. You need a Grow Vest account so your investments, balances, transactions and other account activity can be associated with your personal dashboard.",
      },
    ],
  },
  {
    category: "Investment Plans",
    questions: [
      {
        question: "Where can I see the available plans?",
        answer:
          "All currently active public investment plans are displayed on the Plans page.",
      },
      {
        question: "Can I see the expected profit for a plan?",
        answer:
          "Each available plan displays its investment amount, profit rate, frequency, duration, referral bonus and estimated total profit based on the plan terms.",
      },
      {
        question: "Can plan details change?",
        answer:
          "Available plan terms are controlled by the platform. Always review the current plan information before starting an investment.",
      },
    ],
  },
  {
    category: "Referral Program",
    questions: [
      {
        question: "How does the referral program work?",
        answer:
          "You can invite people using your referral information and monitor your referral network through your Grow Vest account.",
      },
      {
        question: "Can I track my referrals?",
        answer:
          "Yes. Your dashboard provides referral-related information so you can monitor your network and activity.",
      },
      {
        question: "Are referral rewards the same for every plan?",
        answer:
          "Referral bonus rates are associated with individual investment plans, so review the referral bonus displayed for the specific plan you are considering.",
      },
    ],
  },
  {
    category: "Account & Dashboard",
    questions: [
      {
        question: "What can I see from my dashboard?",
        answer:
          "Your dashboard can provide access to balances, investments, deposits, withdrawals, transactions, referrals and other account information.",
      },
      {
        question: "Can I track my investment activity?",
        answer:
          "Yes. Your account is designed to provide a clear view of your running investments and related financial activity.",
      },
      {
        question: "What if I need help?",
        answer:
          "If you need assistance, use the available support channels provided by Grow Vest.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#f7fbf7]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#03291d]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-10 h-80 w-80 rounded-full bg-[#16a34a]/20 blur-[110px]" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#45a94a]/10 blur-[120px]" />
        </div>

        <LandingHeader />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl items-start gap-5">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#45a94a]/15 text-[#70e990] sm:flex">
              <HelpCircle size={28} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#70e990]">
                Help Center
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Frequently Asked{" "}
                <span className="text-[#70e990]">Questions</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                Find answers about accounts, investment plans, referrals and
                using the Grow Vest platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ content */}
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-6 lg:py-20">
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f8f45]">
                  {section.category}
                </p>
              </div>

              <div className="space-y-3">
                {section.questions.map((item) => (
                  <FaqItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Help CTA */}
      <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center rounded-[30px] bg-[#eff8f0] px-6 py-10 text-center sm:px-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#45a94a] shadow-sm">
            <MessageCircle size={22} />
          </div>

          <h2 className="mt-5 text-2xl font-black text-[#173b20]">
            Still Have Questions?
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Explore how Grow Vest works or create your account to start your
            journey.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/learn-more"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#2f7d32] shadow-sm transition hover:bg-[#f5fff6]"
            >
              Learn More
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32]"
            >
              Create Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-[#dceedd] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 text-sm font-bold text-[#173b20]">
        <span>{question}</span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#45a94a] transition group-open:rotate-180">
          <ChevronDown size={16} />
        </span>
      </summary>

      <div className="border-t border-[#edf4ed] px-5 pb-5 pt-4">
        <p className="text-sm leading-7 text-gray-500">{answer}</p>
      </div>
    </details>
  );
}