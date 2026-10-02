"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowUpFromLine,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

type AccountDetails = {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  iban?: string;
};

type Withdrawal = {
  id: string;
  amountPaisa: number;
  method: string;
  accountDetails: AccountDetails;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

function formatPKR(amountPaisa: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(amountPaisa / 100);
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatus(status: Withdrawal["status"]) {
  if (status === "APPROVED") {
    return {
      label: "Approved",
      className: "border-green-200 bg-green-50 text-green-700",
      icon: CheckCircle2,
    };
  }

  if (status === "REJECTED") {
    return {
      label: "Rejected",
      className: "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  };
}

function maskAccountNumber(accountNumber?: string) {
  if (!accountNumber) return "—";

  if (accountNumber.length <= 4) return accountNumber;

  return `${"*".repeat(
    Math.max(0, accountNumber.length - 4)
  )}${accountNumber.slice(-4)}`;
}

export default function WithdrawalHistoryPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/withdrawals/history", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load withdrawal history."
          );
        }

        setWithdrawals(data.withdrawals || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load withdrawal history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="min-h-screen w-full px-4 pb-8 pt-6 md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f7a3a] to-[#45a94a] text-white shadow-[0_5px_16px_rgba(69,169,74,0.25)]">
                <ArrowUpFromLine
                  size={20}
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <h1 className="text-2xl font-black text-[#173b20] md:text-3xl">
                  Withdrawal History
                </h1>

                <p className="mt-0.5 text-xs text-[#6b7d6e] md:text-sm">
                  View all your withdrawal requests and their
                  current status.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/withdraw"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:opacity-90"
          >
            Make New Withdrawal
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-[22px] border border-[#dceedd] bg-white p-10 text-center text-sm text-[#6b7d6e] shadow-[0_6px_24px_rgba(40,90,45,0.06)]">
            Loading withdrawal history...
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          withdrawals.length === 0 && (
            <section className="rounded-[22px] border border-[#dceedd] bg-gradient-to-b from-[#f2f8f2] to-white px-6 py-14 text-center shadow-[0_6px_24px_rgba(40,90,45,0.05)]">
              <div className="mx-auto flex h-13 w-13 items-center justify-center text-[#45a94a]">
                <ArrowUpFromLine size={32} />
              </div>

              <h2 className="mt-4 text-xl font-black text-[#173b20] md:text-2xl">
                No withdrawals yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6b7d6e]">
                Your withdrawal requests will appear here.
              </p>

              <Link
                href="/dashboard/withdraw"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:opacity-90"
              >
                Make Your First Withdrawal
                <ArrowRight size={16} />
              </Link>
            </section>
          )}

        {/* Desktop table */}
        {!loading && withdrawals.length > 0 && (
          <div className="hidden overflow-hidden rounded-[22px] border border-[#dceedd] bg-white shadow-[0_6px_24px_rgba(40,90,45,0.06)] md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#e5eee5] bg-[#f5faf5]">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-[#2f7d32]">
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Account</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Processed</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf3ed]">
                  {withdrawals.map((withdrawal) => {
                    const status = getStatus(withdrawal.status);
                    const StatusIcon = status.icon;
                    const details = withdrawal.accountDetails;

                    return (
                      <tr
                        key={withdrawal.id}
                        className="transition hover:bg-[#f8fcf8]"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#647366]">
                          {formatDateTime(withdrawal.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5 text-sm font-bold text-[#173b20]">
                          {formatPKR(withdrawal.amountPaisa)}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-[#647366]">
                          {withdrawal.method}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="text-sm font-semibold text-[#173b20]">
                            {details?.accountName || "—"}
                          </div>

                          {details?.bankName && (
                            <div className="text-[10px] text-[#89958b]">
                              {details.bankName}
                            </div>
                          )}

                          <div className="font-mono text-[11px] text-[#68766b]">
                            {maskAccountNumber(
                              details?.accountNumber
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-[#718273]">
                          {withdrawal.reviewedAt
                            ? formatDateTime(
                                withdrawal.reviewedAt
                              )
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        {!loading && withdrawals.length > 0 && (
          <div className="space-y-4 md:hidden">
            {withdrawals.map((withdrawal) => {
              const status = getStatus(withdrawal.status);
              const StatusIcon = status.icon;
              const details = withdrawal.accountDetails;

              return (
                <article
                  key={withdrawal.id}
                  className="overflow-hidden rounded-[22px] border border-[#dceedd] bg-white shadow-[0_6px_24px_rgba(40,90,45,0.06)]"
                >
                  {/* Green header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#174d28] via-[#45a94a] to-[#2f7d32] px-4 py-3.5 text-white">
                    <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black">
                          {formatPKR(withdrawal.amountPaisa)}
                        </p>

                        <p className="mt-0.5 text-[10px] text-white/65">
                          {formatDateTime(
                            withdrawal.createdAt
                          )}
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-[#e7eee7] bg-[#f8faf8] p-2.5">
                        <p className="text-[10px] text-[#718273]">
                          Payment Method
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-[#173b20]">
                          {withdrawal.method}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#e7eee7] bg-[#f8faf8] p-2.5">
                        <p className="text-[10px] text-[#718273]">
                          Processed
                        </p>

                        <p className="mt-0.5 text-xs font-bold text-[#173b20]">
                          {withdrawal.reviewedAt
                            ? formatDateTime(
                                withdrawal.reviewedAt
                              )
                            : "—"}
                        </p>
                      </div>

                      <div className="col-span-2 rounded-xl border border-[#e7eee7] bg-[#f8faf8] p-2.5">
                        <p className="text-[10px] text-[#718273]">
                          Account
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-[#173b20]">
                          {details?.accountName || "—"}
                        </p>

                        {details?.bankName && (
                          <p className="text-[10px] text-[#718273]">
                            {details.bankName}
                          </p>
                        )}

                        <p className="mt-0.5 font-mono text-[11px] text-[#647366]">
                          {maskAccountNumber(
                            details?.accountNumber
                          )}
                        </p>
                      </div>
                    </div>

                    {withdrawal.rejectionReason && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">
                          Rejection Reason
                        </p>

                        <p className="mt-1 text-xs text-red-600">
                          {withdrawal.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}