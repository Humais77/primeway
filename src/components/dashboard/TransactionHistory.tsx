"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Search,
  WalletCards,
  X,
  FileText,
  Filter,
  ChevronDown,
  List,
  TrendingUp,
  History,
  Briefcase,
} from "lucide-react";

type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INVESTMENT"
  | "PROFIT"
  | "REFERRAL_COMMISSION"
  | "REFUND";

type Transaction = {
  id: string;
  type: TransactionType;
  amountPaisa: number;
  balanceBeforePaisa: number;
  balanceAfterPaisa: number;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string | Date;
  investmentId?: string | null;
  depositId?: string | null;
  withdrawalId?: string | null;
};

type FilterType =
  | "ALL"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INVESTMENT"
  | "PROFIT"
  | "BONUS";

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDisplayType(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdraw";
    case "INVESTMENT":
      return "Investment";
    case "PROFIT":
      return "Profit";
    case "REFERRAL_COMMISSION":
      return "Bonus";
    case "REFUND":
      return "Refund";
    default:
      return type;
  }
}

function getTypeStyles(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return {
        icon: ArrowDownToLine,
        bg: "bg-emerald-50",
        text: "text-emerald-600",
        amount: "text-emerald-600",
      };

    case "WITHDRAWAL":
      return {
        icon: ArrowUpFromLine,
        bg: "bg-rose-50",
        text: "text-rose-600",
        amount: "text-rose-600",
      };

    case "INVESTMENT":
      return {
        icon: WalletCards,
        bg: "bg-[#EFF8F0]",
        text: "text-[#2F7D32]",
        amount: "text-rose-600",
      };

    case "PROFIT":
      return {
        icon: ArrowDownLeft,
        bg: "bg-teal-50",
        text: "text-teal-600",
        amount: "text-teal-600",
      };

    case "REFERRAL_COMMISSION":
      return {
        icon: Gift,
        bg: "bg-amber-50",
        text: "text-amber-600",
        amount: "text-amber-600",
      };

    case "REFUND":
      return {
        icon: ArrowDownLeft,
        bg: "bg-green-50",
        text: "text-green-600",
        amount: "text-green-600",
      };

    default:
      return {
        icon: ArrowUpRight,
        bg: "bg-gray-50",
        text: "text-gray-600",
        amount: "text-gray-600",
      };
  }
}

export default function TransactionHistory({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const [transactions] = useState<Transaction[]>(
    initialTransactions
  );

  const [filter, setFilter] =
    useState<FilterType>("ALL");

  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "BONUS" &&
          transaction.type === "REFERRAL_COMMISSION") ||
        transaction.type === filter;

      if (!matchesFilter) return false;

      if (!query) return true;

      const searchableText = [
        transaction.type,
        getDisplayType(transaction.type),
        transaction.description,
        transaction.referenceId,
        transaction.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [transactions, filter, search]);

  const clearSearch = () => setSearch("");

  const filterButtonClass = (
    active: boolean
  ) =>
    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
      active
        ? "bg-[#45A94A] text-white shadow-md"
        : "border border-gray-200 bg-white text-gray-600 hover:bg-[#F5FAF5]"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F8FBF8] to-[#EFF7F0] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER CARD */}
        <div className="rounded-[2rem] border border-[#DDEBDD] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1F6B32] to-[#45A94A] text-white shadow-md">
                <FileText size={28} strokeWidth={2.5} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#163B20] md:text-4xl">
                  Transaction History
                </h1>

                <p className="mt-1 text-sm font-medium text-gray-500">
                  All your transactions in one place.
                </p>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search records..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-[#45A94A] focus:ring-1 focus:ring-[#45A94A]"
                />

                {search && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative w-full md:w-auto">
                <button className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-[#F5FAF5] md:w-auto">
                  <Filter
                    size={16}
                    className="text-[#45A94A]"
                  />

                  <span>All</span>

                  <ChevronDown
                    size={16}
                    className="text-gray-400"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-6 overflow-x-auto border-b border-[#DDEBDD] px-2 pb-0">
          <button className="whitespace-nowrap border-b-2 border-[#45A94A] pb-4 text-sm font-bold text-[#45A94A]">
            Transaction History
          </button>
        </div>

        {/* FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setFilter("ALL")}
            className={filterButtonClass(filter === "ALL")}
          >
            <List size={16} />
            All
          </button>

          <button
            onClick={() => setFilter("DEPOSIT")}
            className={filterButtonClass(
              filter === "DEPOSIT"
            )}
          >
            <ArrowDownToLine
              size={16}
              className={
                filter === "DEPOSIT"
                  ? "text-white"
                  : "text-emerald-500"
              }
            />
            Deposit
          </button>

          <button
            onClick={() => setFilter("WITHDRAWAL")}
            className={filterButtonClass(
              filter === "WITHDRAWAL"
            )}
          >
            <ArrowUpFromLine
              size={16}
              className={
                filter === "WITHDRAWAL"
                  ? "text-white"
                  : "text-rose-500"
              }
            />
            Withdraw
          </button>

          <button
            onClick={() => setFilter("INVESTMENT")}
            className={filterButtonClass(
              filter === "INVESTMENT"
            )}
          >
            <Briefcase
              size={16}
              className={
                filter === "INVESTMENT"
                  ? "text-white"
                  : "text-[#2F7D32]"
              }
            />
            Investment
          </button>

          <button
            onClick={() => setFilter("PROFIT")}
            className={filterButtonClass(
              filter === "PROFIT"
            )}
          >
            <TrendingUp
              size={16}
              className={
                filter === "PROFIT"
                  ? "text-white"
                  : "text-teal-500"
              }
            />
            Profit
          </button>

          <button
            onClick={() => setFilter("BONUS")}
            className={filterButtonClass(
              filter === "BONUS"
            )}
          >
            <Gift
              size={16}
              className={
                filter === "BONUS"
                  ? "text-white"
                  : "text-amber-500"
              }
            />
            Bonus
          </button>
        </div>

        {/* TRANSACTION LIST / EMPTY STATE */}
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-[#DDEBDD] bg-white py-20 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EFF8F0] text-[#45A94A]">
              <History
                size={36}
                strokeWidth={2.5}
              />
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#163B20]">
              No history yet
            </h3>

            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Your account activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden rounded-[2rem] border border-[#DDEBDD] bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-[#F3F8F3]">
                    <tr className="text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-5">
                        Transaction
                      </th>
                      <th className="px-6 py-5">
                        Amount
                      </th>
                      <th className="px-6 py-5">
                        Balance
                      </th>
                      <th className="px-6 py-5">
                        Reference
                      </th>
                      <th className="px-6 py-5">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map(
                      (transaction) => {
                        const styles =
                          getTypeStyles(
                            transaction.type
                          );

                        const Icon = styles.icon;

                        return (
                          <tr
                            key={transaction.id}
                            className="border-t border-gray-100 transition hover:bg-[#F8FCF8]"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
                                >
                                  <Icon
                                    size={19}
                                    strokeWidth={2.2}
                                  />
                                </div>

                                <div>
                                  <p className="font-bold text-[#163B20]">
                                    {getDisplayType(
                                      transaction.type
                                    )}
                                  </p>

                                  <p className="mt-1 max-w-[260px] truncate text-xs text-gray-500">
                                    {transaction.description ||
                                      "Transaction"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <p
                                className={`font-black ${styles.amount}`}
                              >
                                {transaction.type ===
                                  "WITHDRAWAL" ||
                                transaction.type ===
                                  "INVESTMENT"
                                  ? "-"
                                  : "+"}

                                {money(
                                  transaction.amountPaisa
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-bold text-[#163B20]">
                                {money(
                                  transaction.balanceAfterPaisa
                                )}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                Before:{" "}
                                {money(
                                  transaction.balanceBeforePaisa
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-5">
                              <p className="max-w-[180px] truncate text-xs font-semibold text-gray-600">
                                {transaction.referenceId ||
                                  "—"}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-sm text-gray-500">
                              {formatDate(
                                transaction.createdAt
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-3 lg:hidden">
              {filteredTransactions.map(
                (transaction) => {
                  const styles =
                    getTypeStyles(
                      transaction.type
                    );

                  const Icon = styles.icon;

                  return (
                    <div
                      key={transaction.id}
                      className="rounded-[1.5rem] border border-[#DDEBDD] bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
                          >
                            <Icon
                              size={19}
                              strokeWidth={2.2}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="font-black text-[#163B20]">
                              {getDisplayType(
                                transaction.type
                              )}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-500">
                              {transaction.description ||
                                "Transaction"}
                            </p>
                          </div>
                        </div>

                        <p
                          className={`shrink-0 font-black ${styles.amount}`}
                        >
                          {transaction.type ===
                            "WITHDRAWAL" ||
                          transaction.type ===
                            "INVESTMENT"
                            ? "-"
                            : "+"}

                          {money(
                            transaction.amountPaisa
                          )}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Balance After
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#163B20]">
                            {money(
                              transaction.balanceAfterPaisa
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-600">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      {transaction.referenceId && (
                        <div className="mt-4 rounded-xl bg-[#F5F8F5] px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            Reference
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-gray-600">
                            {transaction.referenceId}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* FOOTER COUNT */}
        <div className="rounded-[1.5rem] border border-[#DDEBDD] bg-white px-6 py-5 text-center shadow-sm md:text-left">
          <p className="text-sm font-medium text-gray-500">
            Showing {filteredTransactions.length} records on
            this page
          </p>
        </div>
      </div>
    </div>
  );
}