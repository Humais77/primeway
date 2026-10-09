
"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  WalletCards,
} from "lucide-react";

type Method = "EASYPAISA" | "BANK" | "RAAST";

type PlanLimit = {
  id: string;
  name: string;
  dailyLimitPaisa: number | null;
  dailyUsedPaisa: number;
  dailyRemainingPaisa: number | null;
  lifetimeLimitPaisa: number | null;
  lifetimeUsedPaisa: number;
  lifetimeRemainingPaisa: number | null;
  remainingPaisa: number | null;
};

const methods: {
  value: Method;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "EASYPAISA",
    title: "Easypaisa",
    description: "Receive funds in your Easypaisa account.",
    icon: <WalletCards size={22} />,
  },
  {
    value: "BANK",
    title: "Bank Account",
    description: "Receive funds through a bank transfer.",
    icon: <Building2 size={22} />,
  },
  {
    value: "RAAST",
    title: "Raast Payment",
    description: "Receive funds through your Raast account.",
    icon: <CreditCard size={22} />,
  },
];

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function allowance(value: number | null) {
  return value == null ? "No cap" : money(value);
}

export default function WithdrawForm({
  balancePaisa,
  minWithdrawalPaisa,
  userDailyLimitPaisa,
  userDailyUsedPaisa,
  userDailyRemainingPaisa,
  maxAllowedPaisa,
  planLimits,
}: {
  balancePaisa: number;
  minWithdrawalPaisa: number;
  userDailyLimitPaisa: number | null;
  userDailyUsedPaisa: number;
  userDailyRemainingPaisa: number | null;
  maxAllowedPaisa: number;
  planLimits: PlanLimit[];
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

  const selectedMethod = useMemo(
    () => methods.find((item) => item.value === method),
    [method]
  );

  const amountValid =
    Number.isSafeInteger(amountPaisa) &&
    amountPaisa >= minWithdrawalPaisa &&
    amountPaisa <= balancePaisa &&
    amountPaisa <= maxAllowedPaisa;

  const canSubmit =
    amountValid &&
    Boolean(accountName.trim()) &&
    Boolean(accountNumber.trim()) &&
    !loading;

  function amountError() {
    if (!amount.trim()) return "";

    if (!Number.isSafeInteger(amountPaisa) || amountPaisa <= 0) {
      return "Enter a valid amount.";
    }

    if (amountPaisa < minWithdrawalPaisa) {
      return `Minimum withdrawal is ${money(minWithdrawalPaisa)}.`;
    }

    if (amountPaisa > balancePaisa) {
      return "The amount exceeds your available balance.";
    }

    if (amountPaisa > maxAllowedPaisa) {
      return `Your current maximum eligible withdrawal is ${money(maxAllowedPaisa)}.`;
    }

    return "";
  }

  async function submitWithdrawal(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationMessage = amountError();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    if (!accountName.trim() || !accountNumber.trim()) {
      setError("Account holder name and account number are required.");
      return;
    }

    if (method === "BANK" && !bankName.trim()) {
      setError("Enter your bank name.");
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
          accountName: accountName.trim(),
          accountNumber: accountNumber.trim(),
          bankName: method === "BANK" ? bankName.trim() : "",
          iban: method === "BANK" ? iban.trim() : "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit withdrawal.");
      }

      setMessage(
        `Your withdrawal request was submitted successfully${
          data.planName ? ` under ${data.planName}` : ""
        }.`
      );

      setAmount("");
      setAccountName("");
      setAccountNumber("");
      setBankName("");
      setIban("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit withdrawal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#103c2c] via-[#18613f] to-[#18a852] p-6 text-white shadow-[0_14px_40px_rgba(24,97,63,0.18)] md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-green-100">
              Available balance
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              {money(balancePaisa)}
            </p>
            <p className="mt-2 text-xs text-green-100/80">
              Balance is reserved when you submit a withdrawal request.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <WalletCards size={24} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SummaryTile
            label="Minimum withdrawal"
            value={money(minWithdrawalPaisa)}
          />
          <SummaryTile
            label="Maximum currently eligible"
            value={money(maxAllowedPaisa)}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-[#dceedd] bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff8f0] text-[#388e3c]">
            <Info size={20} />
          </div>
          <div>
            <h2 className="font-black text-[#173b20]">Your withdrawal limits</h2>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Your personal daily cap applies across plans. Each eligible plan
              can also have its own daily and lifetime allowance.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <LimitTile
            title="Personal daily limit"
            limit={userDailyLimitPaisa}
            used={userDailyUsedPaisa}
            remaining={userDailyRemainingPaisa}
          />
          <LimitTile
            title="Available balance"
            limit={balancePaisa}
            used={0}
            remaining={balancePaisa}
            balanceMode
          />
        </div>

        {planLimits.length === 0 ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            No eligible investment plan was found for your account. You may
            need to complete an investment before withdrawing.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">
              Investment plan allowances
            </h3>

            {planLimits.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-[#173b20]">{plan.name}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#388e3c]">
                    Remaining: {allowance(plan.remainingPaisa)}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  <div>
                    <p className="text-gray-500">Daily remaining</p>
                    <p className="mt-1 font-bold text-gray-800">
                      {allowance(plan.dailyRemainingPaisa)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lifetime remaining</p>
                    <p className="mt-1 font-bold text-gray-800">
                      {allowance(plan.lifetimeRemainingPaisa)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {message && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          <p className="font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={submitWithdrawal}
        className="rounded-[2rem] border border-[#dceedd] bg-white p-5 shadow-sm md:p-8"
      >
        <h2 className="text-xl font-black text-[#173b20]">
          Request a withdrawal
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose your payout method and enter your account details.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {methods.map((item) => {
            const active = method === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setMethod(item.value)}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-[#45a94a] bg-[#eff8f0] ring-1 ring-[#45a94a]"
                    : "border-gray-200 bg-white hover:border-green-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    active
                      ? "bg-[#45a94a] text-white"
                      : "bg-gray-100 text-[#388e3c]"
                  }`}
                >
                  {item.icon}
                </div>
                <p className="mt-3 text-sm font-black text-[#173b20]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="my-7 border-t border-gray-100" />

        <label className="block">
          <span className="mb-2 block text-xs font-bold text-gray-600">
            Withdrawal amount (PKR)
          </span>
          <input
            required
            type="number"
            min={minWithdrawalPaisa / 100}
            max={Math.min(balancePaisa, maxAllowedPaisa) / 100}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder={`Minimum ${money(minWithdrawalPaisa)}`}
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#45a94a] focus:bg-white focus:ring-1 focus:ring-[#45a94a]"
          />
          {amountError() && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {amountError()}
            </p>
          )}
        </label>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TextField
            label="Account holder name"
            value={accountName}
            onChange={setAccountName}
            placeholder="Enter account holder name"
          />
          <TextField
            label="Account number"
            value={accountNumber}
            onChange={setAccountNumber}
            placeholder="Enter account number"
          />
        </div>

        {method === "BANK" && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <TextField
              label="Bank name"
              value={bankName}
              onChange={setBankName}
              placeholder="e.g. HBL"
            />
            <TextField
              label="IBAN (optional)"
              value={iban}
              onChange={setIban}
              placeholder="PK..."
            />
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-[#dceedd] bg-[#f5faf5] p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-500">Payout method</span>
            <span className="font-bold text-[#173b20]">
              {selectedMethod?.title}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-500">Withdrawal amount</span>
            <span className="font-black text-[#173b20]">
              {amountPaisa > 0 ? money(amountPaisa) : money(0)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3 text-sm">
            <span className="font-bold text-gray-600">
              Balance after request
            </span>
            <span className="font-black text-[#388e3c]">
              {money(Math.max(0, balancePaisa - amountPaisa))}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#45a94a] to-[#2f7d32] px-5 text-sm font-black text-white shadow-md transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Submitting request...
            </>
          ) : (
            <>
              Submit withdrawal request
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-gray-400">
          Your request will be reviewed by the administration. Your balance is
          reserved when the request is submitted.
        </p>
      </form>
    </div>
  );
}

function SummaryTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-3">
      <p className="text-xs text-green-100">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}

function LimitTile({
  title,
  limit,
  used,
  remaining,
  balanceMode = false,
}: {
  title: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  balanceMode?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <p className="mt-1 text-lg font-black text-[#173b20]">
        {balanceMode ? allowance(limit) : allowance(limit)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-gray-500">
          {balanceMode ? "Available" : "Used today"}
        </span>
        <span className="font-bold text-gray-700">
          {balanceMode ? allowance(remaining) : money(used)}
        </span>
      </div>
      {!balanceMode && (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-500">Remaining today</span>
          <span className="font-bold text-[#388e3c]">
            {allowance(remaining)}
          </span>
        </div>
      )}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-gray-600">
        {label}
      </span>
      <input
        required={label !== "IBAN (optional)"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#45a94a] focus:bg-white focus:ring-1 focus:ring-[#45a94a]"
      />
    </label>
  );
}