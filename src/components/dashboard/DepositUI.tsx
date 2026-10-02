"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Copy,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  Smartphone,
  Wallet,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Gateway = "EASYPAISA" | "BANK" | "RAAST";

type Props = {
  plan: {
    id: string;
    name: string;
    amountPaisa: number;
  } | null;

  initialMethod: string | null;
};

type Account = {
  id: string;
  gateway: Gateway;
  accountName: string;
  accountNumber: string;
  processingChargePaisa: number;
};

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-PK")}`;
}

export default function DepositUI({
  plan,
  initialMethod,
}: Props) {
  const router = useRouter();

  const [method, setMethod] = useState<Gateway | null>(
    initialMethod === "EASYPAISA" ||
      initialMethod === "BANK" ||
      initialMethod === "RAAST"
      ? initialMethod
      : null
  );

  const [account, setAccount] = useState<Account | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!method) {
      setAccount(null);
      return;
    }

    async function loadAccount() {
      setLoadingAccount(true);

      try {
        const response = await fetch(
          `/api/deposit/accounts?gateway=${method}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        setAccount(data.account);
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Unable to load payment account."
        );

        setAccount(null);
      } finally {
        setLoadingAccount(false);
      }
    }

    loadAccount();
  }, [method]);

  function selectMethod(selected: Gateway) {
    setMethod(selected);

    if (plan) {
      router.replace(
        `/dashboard/deposit?planId=${plan.id}&method=${selected}`
      );
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!plan) {
      alert("Please select an investment plan first.");
      return;
    }

    if (!method || !account) {
      alert("Please select a payment method.");
      return;
    }

    if (!transactionId.trim()) {
      alert("Transaction ID is required.");
      return;
    }

    if (!screenshot) {
      alert("Payment screenshot is required.");
      return;
    }

    setSubmitting(true);

    try {
      const uploadData = new FormData();

      uploadData.append("screenshot", screenshot);

      const uploadResponse = await fetch("/api/deposit/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message);
      }

      const response = await fetch("/api/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          gateway: method,
          transactionReference: transactionId.trim(),
          proofUrl: uploadResult.url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to submit deposit."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!plan) {
    return (
      <div className="rounded-3xl border border-[#DDEBDD] bg-white p-10 text-center shadow-sm">
        <Wallet
          className="mx-auto text-[#45A94A]"
          size={42}
        />

        <h1 className="mt-5 text-2xl font-black text-[#163B20]">
          Select an Investment Plan
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Please select an investment plan before making a deposit.
        </p>

        <button
          onClick={() =>
            router.push("/dashboard/invest-plan")
          }
          className="mt-6 rounded-xl bg-[#45A94A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2F7D32]"
        >
          View Investment Plans
        </button>
      </div>
    );
  }

  const exactAmount =
    plan.amountPaisa +
    (account?.processingChargePaisa || 0);

  if (success) {
    return (
      <div className="rounded-3xl border border-[#DDEBDD] bg-white p-10 text-center shadow-sm">
        <CheckCircle2
          size={58}
          className="mx-auto text-[#45A94A]"
        />

        <h1 className="mt-5 text-2xl font-black text-[#163B20]">
          Deposit Submitted
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
          Your deposit request has been submitted successfully.
          The admin will review your transaction and screenshot.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-[#EFF8F0] p-5">
          <p className="text-xs font-bold uppercase text-[#45A94A]">
            Amount Submitted
          </p>

          <p className="mt-1 text-2xl font-black text-[#2F7D32]">
            {money(plan.amountPaisa)}
          </p>
        </div>

        <button
          onClick={() =>
            router.push("/dashboard/deposit-history")
          }
          className="mt-6 rounded-xl bg-[#45A94A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2F7D32]"
        >
          View Deposit History
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-black text-[#163B20] md:text-4xl">
          Make a Deposit
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Complete your payment to activate your selected
          investment plan.
        </p>
      </div>

      {/* Selected Plan */}
      <div className="mb-6 rounded-3xl border border-green-100 bg-[#EFF8F0] p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#45A94A]">
          Selected Plan
        </p>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#163B20]">
              {plan.name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Plan Amount
            </p>
          </div>

          <p className="text-2xl font-black text-[#45A94A]">
            {money(plan.amountPaisa)}
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <section className="rounded-3xl border border-[#DDEBDD] bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-xl font-black text-[#163B20]">
          Choose Your Payment Method
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Select where you want to make your payment.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <MethodCard
            title="EasyPaisa"
            description="Pay through EasyPaisa"
            icon={<Smartphone size={23} />}
            active={method === "EASYPAISA"}
            onClick={() => selectMethod("EASYPAISA")}
          />

          <MethodCard
            title="Bank Account"
            description="Direct bank transfer"
            icon={<Building2 size={23} />}
            active={method === "BANK"}
            onClick={() => selectMethod("BANK")}
          />

          <MethodCard
            title="Raast Payment"
            description="Pay through Raast"
            icon={<CreditCard size={23} />}
            active={method === "RAAST"}
            onClick={() => selectMethod("RAAST")}
          />
        </div>
      </section>

      {method && (
        <section className="mt-6 rounded-3xl border border-[#DDEBDD] bg-white p-5 shadow-sm md:p-7">
          {loadingAccount ? (
            <div className="flex items-center justify-center py-16">
              <Loader2
                size={28}
                className="animate-spin text-[#45A94A]"
              />
            </div>
          ) : !account ? (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-sm font-semibold text-red-600">
              No active account is currently available for this
              payment method.
            </div>
          ) : (
            <>
              {/* Account details */}
              <div className="rounded-2xl bg-gradient-to-br from-[#1F6B32] via-[#45A94A] to-[#2F7D32] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Payment Account
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {method === "EASYPAISA"
                    ? "EasyPaisa"
                    : method === "BANK"
                      ? "Bank Account"
                      : "Raast Payment"}
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/60">
                      Account Name
                    </p>

                    <p className="mt-1 font-bold">
                      {account.accountName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-white/60">
                      Account Number
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-bold">
                        {account.accountNumber}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            account.accountNumber
                          )
                        }
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment form */}
              <form onSubmit={submit} className="mt-7">
                <h2 className="text-xl font-black text-[#163B20]">
                  Enter Payment Details
                </h2>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <SummaryField
                    label="Selected Plan"
                    value={plan.name}
                  />

                  <SummaryField
                    label="Plan Amount"
                    value={money(plan.amountPaisa)}
                  />

                  <SummaryField
                    label="Processing Charge"
                    value={money(
                      account.processingChargePaisa
                    )}
                  />

                  <SummaryField
                    label="Exact Amount to Pay"
                    value={money(exactAmount)}
                    highlight
                  />
                </div>

                <div className="mt-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-700">
                      Transaction ID (TID) *
                    </span>

                    <input
                      required
                      value={transactionId}
                      onChange={(event) =>
                        setTransactionId(event.target.value)
                      }
                      placeholder="Enter your transaction ID"
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition focus:border-[#45A94A] focus:bg-white focus:ring-1 focus:ring-[#45A94A]"
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-700">
                      Payment Screenshot *
                    </span>

                    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF8F0] text-[#45A94A]">
                          <ImageIcon size={22} />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-700">
                            Upload payment screenshot
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            JPG, PNG or WEBP · Max 5MB
                          </p>
                        </div>

                        <input
                          required
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) =>
                            setScreenshot(
                              event.target.files?.[0] || null
                            )
                          }
                          className="max-w-[180px] text-xs"
                        />
                      </div>

                      {screenshot && (
                        <p className="mt-3 text-xs font-semibold text-[#45A94A]">
                          Selected: {screenshot.name}
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                <button
                  disabled={submitting}
                  className="mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#45A94A] to-[#2F7D32] text-sm font-bold text-white shadow-lg transition hover:from-[#2F7D32] hover:to-[#1F6B32] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Deposit
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </section>
      )}
    </div>
  );
}

function MethodCard({
  title,
  description,
  icon,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-[#45A94A] bg-[#EFF8F0] shadow-md ring-1 ring-[#45A94A]"
          : "border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-[#F5FAF5]"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          active
            ? "bg-[#45A94A] text-white"
            : "bg-white text-[#45A94A]"
        }`}
      >
        {icon}
      </div>

      <h3 className="mt-4 font-black text-[#163B20]">
        {title}
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </button>
  );
}

function SummaryField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-green-100 bg-[#EFF8F0]"
          : "border-gray-100 bg-gray-50"
      }`}
    >
      <p className="text-xs text-gray-500">{label}</p>

      <p
        className={`mt-1 text-base font-black ${
          highlight
            ? "text-[#2F7D32]"
            : "text-[#163B20]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}