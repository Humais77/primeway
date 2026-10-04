"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  Coins,
  CreditCard,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "INVESTMENT"
  | "PROFIT"
  | "REFERRAL_COMMISSION"
  | "REFUND";

type Transaction = {
  id: string;

  userId: string;

  type: TransactionType;

  amountPaisa: number;

  balanceBeforePaisa: number;

  balanceAfterPaisa: number;

  referenceId?: string | null;

  description?: string | null;

  investmentId?: string | null;

  depositId?: string | null;

  withdrawalId?: string | null;

  createdAt: string;

  user?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  };
};

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString(
    "en-PK"
  )}`;
}

function formatDate(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-PK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function transactionLabel(
  type: TransactionType
) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";

    case "WITHDRAWAL":
      return "Withdrawal";

    case "INVESTMENT":
      return "Investment";

    case "PROFIT":
      return "Profit";

    case "REFERRAL_COMMISSION":
      return "Referral Bonus";

    case "REFUND":
      return "Refund";

    default:
      return type;
  }
}

function TransactionIcon({
  type,
}: {
  type: TransactionType;
}) {
  if (type === "DEPOSIT") {
    return <ArrowDownToLine size={15} />;
  }

  if (type === "WITHDRAWAL") {
    return <ArrowUpFromLine size={15} />;
  }

  if (type === "INVESTMENT") {
    return <TrendingUp size={15} />;
  }

  if (type === "PROFIT") {
    return <Coins size={15} />;
  }

  if (type === "REFERRAL_COMMISSION") {
    return <Wallet size={15} />;
  }

  return <RefreshCw size={15} />;
}

function typeClasses(
  type: TransactionType
) {
  switch (type) {
    case "DEPOSIT":
      return "bg-green-50 text-green-700 border-green-100";

    case "PROFIT":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";

    case "INVESTMENT":
      return "bg-blue-50 text-blue-700 border-blue-100";

    case "WITHDRAWAL":
      return "bg-red-50 text-red-700 border-red-100";

    case "REFERRAL_COMMISSION":
      return "bg-purple-50 text-purple-700 border-purple-100";

    case "REFUND":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";

    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
  }
}

function amountClasses(
  type: TransactionType
) {
  if (
    type === "PROFIT" ||
    type === "DEPOSIT" ||
    type === "REFERRAL_COMMISSION" ||
    type === "REFUND"
  ) {
    return "text-green-600";
  }

  return "text-[#173b20]";
}

export default function TransactionsAdmin({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const [
    transactions,
    setTransactions,
  ] = useState(
    initialTransactions
  );

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState<
      "ALL" | TransactionType
    >("ALL");

  const [loading, setLoading] =
    useState(false);

  /*
   * ----------------------------------------------------------
   * Filter transactions locally
   * ----------------------------------------------------------
   */

  const filteredTransactions =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return transactions.filter(
        (transaction) => {
          const matchesType =
            typeFilter === "ALL" ||
            transaction.type ===
              typeFilter;

          if (!matchesType) {
            return false;
          }

          if (!query) {
            return true;
          }

          return (
            transaction.user
              ?.fullName
              ?.toLowerCase()
              .includes(query) ||
            transaction.user
              ?.username
              ?.toLowerCase()
              .includes(query) ||
            transaction.user
              ?.email
              ?.toLowerCase()
              .includes(query) ||
            transaction.id
              .toLowerCase()
              .includes(query) ||
            transaction.referenceId
              ?.toLowerCase()
              .includes(query) ||
            transaction.description
              ?.toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      transactions,
      search,
      typeFilter,
    ]);

  /*
   * ----------------------------------------------------------
   * Refresh
   * ----------------------------------------------------------
   */

  async function refreshTransactions() {
    if (loading) return;

    setLoading(true);

    try {
      const query =
        typeFilter !== "ALL"
          ? `?type=${encodeURIComponent(
              typeFilter
            )}`
          : "";

      const response =
        await fetch(
          `/api/admin/transactions${query}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load transactions."
        );
      }

      setTransactions(
        data.transactions || []
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ----------------------------------------------------------
   * Statistics
   * ----------------------------------------------------------
   */

  const totalProfit =
    transactions
      .filter(
        (item) =>
          item.type ===
          "PROFIT"
      )
      .reduce(
        (sum, item) =>
          sum +
          item.amountPaisa,
        0
      );

  const totalDeposits =
    transactions
      .filter(
        (item) =>
          item.type ===
          "DEPOSIT"
      )
      .reduce(
        (sum, item) =>
          sum +
          item.amountPaisa,
        0
      );

  const totalWithdrawals =
    transactions
      .filter(
        (item) =>
          item.type ===
          "WITHDRAWAL"
      )
      .reduce(
        (sum, item) =>
          sum +
          item.amountPaisa,
        0
      );

  return (
    <div className="space-y-6">
      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={
            <ArrowDownToLine
              size={20}
            />
          }
          label="Total Deposits"
          value={money(
            totalDeposits
          )}
        />

        <StatCard
          icon={
            <Coins size={20} />
          }
          label="Total Profits"
          value={money(
            totalProfit
          )}
        />

        <StatCard
          icon={
            <ArrowUpFromLine
              size={20}
            />
          }
          label="Total Withdrawals"
          value={money(
            totalWithdrawals
          )}
        />
      </div>

      {/* =====================================================
          TRANSACTION TABLE
          ===================================================== */}

      <div className="overflow-hidden rounded-3xl border border-[#dceedd] bg-white shadow-sm">
        {/* Header / Filters */}

        <div className="flex flex-col gap-4 border-b border-[#edf4ed] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#173b20]">
              Transaction Ledger
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredTransactions.length}{" "}
              transaction
              {filteredTransactions.length ===
              1
                ? ""
                : "s"}{" "}
              displayed
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search user or transaction..."
                className="h-10 w-full rounded-lg border border-[#dceedd] bg-[#f9fcf9] pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#8fca93] focus:ring-2 focus:ring-[#e8f5e9] sm:w-[270px]"
              />
            </div>

            {/* Type filter */}

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target
                      .value as
                      | "ALL"
                      | TransactionType
                  )
                }
                className="h-10 appearance-none rounded-lg border border-[#dceedd] bg-[#f9fcf9] px-3 pr-9 text-sm font-semibold text-[#173b20] outline-none focus:border-[#8fca93] focus:ring-2 focus:ring-[#e8f5e9]"
              >
                <option value="ALL">
                  All Types
                </option>

                <option value="DEPOSIT">
                  Deposits
                </option>

                <option value="WITHDRAWAL">
                  Withdrawals
                </option>

                <option value="INVESTMENT">
                  Investments
                </option>

                <option value="PROFIT">
                  Profits
                </option>

                <option value="REFERRAL_COMMISSION">
                  Referral Bonuses
                </option>

                <option value="REFUND">
                  Refunds
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Refresh */}

            <button
              type="button"
              onClick={
                refreshTransactions
              }
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dceedd] bg-[#eff8f0] px-4 text-xs font-bold text-[#2f7d32] transition hover:bg-[#e4f4e5] disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* Table */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] text-left">
            <thead className="bg-[#f4faf4]">
              <tr className="text-xs uppercase tracking-wider text-[#2f7d32]">
                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Balance Before
                </th>

                <th className="px-5 py-4">
                  Balance After
                </th>

                <th className="px-5 py-4">
                  Description
                </th>

                <th className="px-5 py-4">
                  Reference
                </th>

                <th className="px-5 py-4">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map(
                (transaction) => (
                  <tr
                    key={
                      transaction.id
                    }
                    className="border-t border-[#edf4ed] transition hover:bg-[#f9fcf9]"
                  >
                    {/* User */}

                    <td className="px-5 py-4">
                      <p className="font-bold text-[#173b20]">
                        {
                          transaction
                            .user
                            ?.fullName
                        }
                      </p>

                      <p className="text-xs text-gray-500">
                        @
                        {
                          transaction
                            .user
                            ?.username
                        }
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {
                          transaction
                            .user
                            ?.email
                        }
                      </p>
                    </td>

                    {/* Type */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${typeClasses(
                          transaction.type
                        )}`}
                      >
                        <TransactionIcon
                          type={
                            transaction.type
                          }
                        />

                        {transactionLabel(
                          transaction.type
                        )}
                      </span>
                    </td>

                    {/* Amount */}

                    <td className="px-5 py-4">
                      <p
                        className={`font-black ${amountClasses(
                          transaction.type
                        )}`}
                      >
                        {money(
                          transaction.amountPaisa
                        )}
                      </p>
                    </td>

                    {/* Before */}

                    <td className="px-5 py-4 font-medium text-gray-600">
                      {money(
                        transaction.balanceBeforePaisa
                      )}
                    </td>

                    {/* After */}

                    <td className="px-5 py-4">
                      <span className="font-bold text-[#173b20]">
                        {money(
                          transaction.balanceAfterPaisa
                        )}
                      </span>
                    </td>

                    {/* Description */}

                    <td className="max-w-[300px] px-5 py-4">
                      <p
                        className="truncate text-sm text-gray-600"
                        title={
                          transaction.description ||
                          ""
                        }
                      >
                        {transaction.description ||
                          "—"}
                      </p>
                    </td>

                    {/* Reference */}

                    <td className="px-5 py-4">
                      <span
                        className="block max-w-[190px] truncate font-mono text-xs text-[#173b20]"
                        title={
                          transaction.referenceId ||
                          ""
                        }
                      >
                        {transaction.referenceId ||
                          "—"}
                      </span>
                    </td>

                    {/* Date */}

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-500">
                      {formatDate(
                        transaction.createdAt
                      )}
                    </td>
                  </tr>
                )
              )}

              {filteredTransactions.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <CreditCard
                        size={32}
                        className="mb-3 text-gray-300"
                      />

                      <p className="text-sm font-semibold text-gray-500">
                        No transactions
                        found.
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Try changing
                        your search or
                        transaction
                        type filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dceedd] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff8f0] text-[#2f7d32]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-[#173b20]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}