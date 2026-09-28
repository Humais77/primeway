"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  WalletCards,
} from "lucide-react";

type Method = "EASYPAISA" | "BANK" | "RAAST";

const methods: {
  value: Method;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "EASYPAISA",
    title: "Easypaisa",
    description: "Receive your withdrawal in your Easypaisa account.",
    icon: <WalletCards size={22} />,
  },
  {
    value: "BANK",
    title: "Bank Account",
    description: "Receive your withdrawal directly into your bank account.",
    icon: <Building2 size={22} />,
  },
  {
    value: "RAAST",
    title: "Raast Payment",
    description: "Receive your withdrawal through your Raast account.",
    icon: <CreditCard size={22} />,
  },
];

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function WithdrawForm({
  balancePaisa,
  minWithdrawalPaisa,
}: {
  balancePaisa: number;
  minWithdrawalPaisa: number;
}) {
  const [method, setMethod] = useState<Method>("EASYPAISA");
  const [amount, setAmount] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const amountPaisa = Math.round(Number(amount || 0) * 100);
  const isBelowMinimum = amountPaisa > 0 && amountPaisa < minWithdrawalPaisa;
  const insufficient = amountPaisa > balancePaisa;

  const canSubmit =
    amountPaisa >= minWithdrawalPaisa &&
    amountPaisa <= balancePaisa &&
    accountName.trim() &&
    accountNumber.trim() &&
    !loading;

  const selectedMethod = useMemo(
    () => methods.find((item) => item.value === method),
    [method]
  );

  async function submitWithdrawal(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (amountPaisa < minWithdrawalPaisa) {
      setError(`Minimum withdrawal amount is ${money(minWithdrawalPaisa)}.`);
      return;
    }
    if (amountPaisa > balancePaisa) {
      setError("Insufficient available balance.");
      return;
    }
    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }
    if (!accountNumber.trim()) {
      setError("Account number is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountPaisa,
          method,
          accountName,
          accountNumber,
          bankName: method === "BANK" ? bankName : "",
          iban: method === "BANK" ? iban : "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit withdrawal.");
      }

      setMessage("Your withdrawal request has been submitted successfully.");
      setAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
      setIban("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to submit withdrawal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* BALANCE CARD - Using Sidebar Gradient */}
      <div className="rounded-[2rem] bg-gradient-to-br from-[#281477] via-[#241675] to-[#102d79] p-6 text-white shadow-lg md:p-8">
        <p className="text-sm font-medium text-blue-200">
          Available Balance
        </p>
        <p className="mt-2 text-4xl font-black tracking-tight">
          {money(balancePaisa)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-wider text-blue-200">
              Minimum Withdrawal
            </p>
            <p className="mt-1 text-sm font-bold">
              {money(minWithdrawalPaisa)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.08] px-4 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-wider text-blue-200">
              Payment
            </p>
            <p className="mt-1 text-sm font-bold">
              Manual Processing
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p className="font-medium">{message}</p>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 shadow-sm">
          {error}
        </div>
      )}

      {/* FORM CARD */}
      <form
        onSubmit={submitWithdrawal}
        className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8"
      >
        {/* PAYMENT METHOD */}
        <div>
          <h2 className="text-xl font-black text-[#111b58]">
            Choose Payment Method
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select where you want to receive your withdrawal.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {methods.map((item) => {
              const selected = method === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMethod(item.value)}
                  className={`
                    group relative rounded-2xl border p-5 text-left transition-all duration-200
                    ${
                      selected
                        ? "border-[#281477] bg-[#281477]/5 shadow-md ring-1 ring-[#281477]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <div
                    className={`
                      flex h-12 w-12 items-center justify-center rounded-xl transition-colors
                      ${
                        selected
                          ? "bg-[#281477] text-white"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }
                    `}
                  >
                    {item.icon}
                  </div>

                  <p className="mt-4 text-sm font-black text-[#111b58]">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-gray-500">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-8 border-t border-gray-100" />

        {/* WITHDRAWAL DETAILS */}
        <div>
          <h2 className="text-xl font-black text-[#111b58]">
            Withdrawal Details
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the account where you want to receive the funds.
          </p>

          {/* AMOUNT */}
          <label className="mt-6 block">
            <span className="mb-2 block text-xs font-bold text-gray-600">
              Withdrawal Amount (PKR)
            </span>
            <input
              required
              type="number"
              min={minWithdrawalPaisa / 100}
              max={balancePaisa / 100}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={`Minimum ${money(minWithdrawalPaisa)}`}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#281477] focus:bg-white focus:ring-1 focus:ring-[#281477]"
            />
            {isBelowMinimum && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                Minimum withdrawal is {money(minWithdrawalPaisa)}
              </p>
            )}
            {insufficient && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                Amount exceeds your available balance.
              </p>
            )}
          </label>

          {/* ACCOUNT DETAILS */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-bold text-gray-600">
                Account Name
              </span>
              <input
                required
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Enter account holder name"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#281477] focus:bg-white focus:ring-1 focus:ring-[#281477]"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs font-bold text-gray-600">
                Account Number
              </span>
              <input
                required
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                placeholder="03XXXXXXXXX"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#281477] focus:bg-white focus:ring-1 focus:ring-[#281477]"
              />
            </label>
          </div>

          {/* BANK SPECIFIC DETAILS */}
          {method === "BANK" && (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  Bank Name
                </span>
                <input
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder="e.g. HBL"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#281477] focus:bg-white focus:ring-1 focus:ring-[#281477]"
                />
              </label>

              <label>
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  IBAN
                </span>
                <input
                  value={iban}
                  onChange={(event) => setIban(event.target.value)}
                  placeholder="PK..."
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#281477] focus:bg-white focus:ring-1 focus:ring-[#281477]"
                />
              </label>
            </div>
          )}
        </div>

        {/* SUMMARY BOX */}
        <div className="mt-8 rounded-2xl border border-gray-100 bg-[#f8f9fc] p-5 md:p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Payment Method</span>
            <span className="text-sm font-bold text-[#111b58]">
              {selectedMethod?.title}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">Withdrawal Amount</span>
            <span className="font-black text-[#111b58]">
              {amountPaisa > 0 ? money(amountPaisa) : "Rs 0.00"}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-sm font-bold text-gray-600">
              Available After Request
            </span>
            <span className="text-lg font-black text-[#281477]">
              {money(Math.max(0, balancePaisa - amountPaisa))}
            </span>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#281477] px-6 text-sm font-black text-white shadow-md transition hover:bg-[#1e105c] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? "Submitting..." : "Submit Withdrawal"}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-gray-400">
          Withdrawals are manually processed by the administration. Your
          balance is reserved when the request is submitted.
        </p>
      </form>
    </div>
  );
}