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
    case "DEPOSIT": return "Deposit";
    case "WITHDRAWAL": return "Withdraw";
    case "INVESTMENT": return "Investment";
    case "PROFIT": return "Profit";
    case "REFERRAL_COMMISSION": return "Bonus";
    case "REFUND": return "Refund";
    default: return type;
  }
}

function getTypeStyles(type: TransactionType) {
  switch (type) {
    case "DEPOSIT":
      return { icon: ArrowDownToLine, bg: "bg-emerald-50", text: "text-emerald-600", amount: "text-emerald-600" };
    case "WITHDRAWAL":
      return { icon: ArrowUpFromLine, bg: "bg-rose-50", text: "text-rose-600", amount: "text-rose-600" };
    case "INVESTMENT":
      return { icon: WalletCards, bg: "bg-[#102d79]/10", text: "text-[#102d79]", amount: "text-rose-600" };
    case "PROFIT":
      return { icon: ArrowDownLeft, bg: "bg-teal-50", text: "text-teal-600", amount: "text-teal-600" };
    case "REFERRAL_COMMISSION":
      return { icon: Gift, bg: "bg-amber-50", text: "text-amber-600", amount: "text-amber-600" };
    case "REFUND":
      return { icon: ArrowDownLeft, bg: "bg-indigo-50", text: "text-indigo-600", amount: "text-indigo-600" };
    default:
      return { icon: ArrowUpRight, bg: "bg-gray-50", text: "text-gray-600", amount: "text-gray-600" };
  }
}

export default function TransactionHistory({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "BONUS" && transaction.type === "REFERRAL_COMMISSION") ||
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#faf9ff] to-[#f1efff] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* HEADER CARD */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#281477] to-[#102d79] text-white shadow-md">
                <FileText size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#111b58] md:text-4xl">
                  Transaction History
                </h1>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  All your transactions in one place.
                </p>
              </div>
            </div>

            {/* Right: Search + Dropdown */}
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              
              {/* Search Input (Now positioned in header) */}
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search records..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none transition focus:border-[#281477] focus:ring-1 focus:ring-[#281477]"
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

              {/* Dropdown Filter */}
              <div className="relative w-full md:w-auto">
                <button className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 md:w-auto">
                  <Filter size={16} className="text-[#281477]" />
                  <span>All</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-6 overflow-x-auto border-b border-gray-200 px-2 pb-0">
          {[
            { label: "Transaction History", active: true },
          ].map((tab, idx) => (
            <button
              key={idx}
              className={`whitespace-nowrap pb-4 text-sm font-bold transition-all ${
                tab.active
                  ? "border-b-2 border-[#281477] text-[#281477]"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* FILTER PILLS */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* All Button */}
            <button
              onClick={() => setFilter("ALL")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                filter === "ALL"
                  ? "bg-[#281477] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <List size={16} />
              All
            </button>

            {/* Deposit */}
            <button
              onClick={() => setFilter("DEPOSIT")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                filter === "DEPOSIT"
                  ? "bg-[#281477] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <ArrowDownToLine size={16} className={filter === "DEPOSIT" ? "text-white" : "text-emerald-500"} />
              Deposit
            </button>

            {/* Withdraw */}
            <button
              onClick={() => setFilter("WITHDRAWAL")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                filter === "WITHDRAWAL"
                  ? "bg-[#281477] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <ArrowUpFromLine size={16} className={filter === "WITHDRAWAL" ? "text-white" : "text-rose-500"} />
              Withdraw
            </button>

            {/* Investment */}
            <button
              onClick={() => setFilter("INVESTMENT")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                filter === "INVESTMENT"
                  ? "bg-[#281477] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Briefcase size={16} className={filter === "INVESTMENT" ? "text-white" : "text-[#102d79]"} />
              Investment
            </button>

            {/* Profit */}
            <button
              onClick={() => setFilter("PROFIT")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                filter === "PROFIT"
                  ? "bg-[#281477] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <TrendingUp size={16} className={filter === "PROFIT" ? "text-white" : "text-teal-500"} />
              Profit
            </button>

            {/* Bonus */}
            <button
              onClick={() => setFilter("BONUS")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                filter === "BONUS"
                  ? "bg-[#281477] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Gift size={16} className={filter === "BONUS" ? "text-white" : "text-amber-500"} />
              Bonus
            </button>
          </div>

          
        </div>

        {/* TRANSACTION LIST / EMPTY STATE */}
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] bg-white py-20 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#281477]/10 text-[#281477]">
              <History size={36} strokeWidth={2.5} />
            </div>
            <h3 className="mt-6 text-xl font-bold text-[#111b58]">
              No history yet
            </h3>
            <p className="mt-2 max-w-xs text-sm text-gray-500">
              Your account activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-hidden rounded-[2rem] bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-[#f4f6fc]">
                    <tr className="text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-5">Transaction</th>
                      <th className="px-6 py-5">Amount</th>
                      <th className="px-6 py-5">Balance</th>
                      <th className="px-6 py-5">Reference</th>
                      <th className="px-6 py-5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const styles = getTypeStyles(transaction.type);
                      const Icon = styles.icon;
                      return (
                        <tr key={transaction.id} className="border-t border-gray-100 transition hover:bg-gray-50/70">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}>
                                <Icon size={19} strokeWidth={2.2} />
                              </div>
                              <div>
                                <p className="font-bold text-[#111b58]">
                                  {getDisplayType(transaction.type)}
                                </p>
                                <p className="mt-1 max-w-[260px] truncate text-xs text-gray-500">
                                  {transaction.description || "Transaction"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className={`font-black ${styles.amount}`}>
                              {transaction.type === "WITHDRAWAL" || transaction.type === "INVESTMENT" ? "-" : "+"}
                              {money(transaction.amountPaisa)}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-[#111b58]">
                              {money(transaction.balanceAfterPaisa)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              Before: {money(transaction.balanceBeforePaisa)}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="max-w-[180px] truncate text-xs font-semibold text-gray-600">
                              {transaction.referenceId || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-3 lg:hidden">
              {filteredTransactions.map((transaction) => {
                const styles = getTypeStyles(transaction.type);
                const Icon = styles.icon;
                return (
                  <div key={transaction.id} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}>
                          <Icon size={19} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[#111b58]">
                            {getDisplayType(transaction.type)}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {transaction.description || "Transaction"}
                          </p>
                        </div>
                      </div>
                      <p className={`shrink-0 font-black ${styles.amount}`}>
                        {transaction.type === "WITHDRAWAL" || transaction.type === "INVESTMENT" ? "-" : "+"}
                        {money(transaction.amountPaisa)}
                      </p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Balance After</p>
                        <p className="mt-1 text-sm font-bold text-[#111b58]">
                          {money(transaction.balanceAfterPaisa)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Date</p>
                        <p className="mt-1 text-sm font-semibold text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    {transaction.referenceId && (
                      <div className="mt-4 rounded-xl bg-gray-50 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Reference</p>
                        <p className="mt-1 truncate text-xs font-semibold text-gray-600">
                          {transaction.referenceId}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER COUNT */}
        <div className="rounded-[1.5rem] bg-white px-6 py-5 text-center shadow-sm md:text-left">
          <p className="text-sm font-medium text-gray-500">
            Showing {filteredTransactions.length} records on this page
          </p>
        </div>

      </div>
    </div>
  );
}