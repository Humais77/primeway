"use client";

import {
  Check,
  ExternalLink,
  Eye,
  Loader2,
  X,
} from "lucide-react";

import { useState } from "react";

type Deposit = {
  id: string;

  amountPaisa: number;

  processingChargePaisa: number;

  exactAmountPaisa: number;

  method: string;

  transactionReference: string;

  proofUrl: string;

  paymentAccountName: string;

  paymentAccountNumber: string;

  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

  rejectionReason?: string | null;

  createdAt: string;

  user?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  };

  plan?: {
    id: string;
    name: string;
  };
};

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString(
    "en-PK"
  )}`;
}

export default function DepositsAdmin({
  initialDeposits,
}: {
  initialDeposits: Deposit[];
}) {
  const [deposits, setDeposits] =
    useState(initialDeposits);

  const [busyId, setBusyId] =
    useState<string | null>(null);

  async function review(
    deposit: Deposit,
    action: "APPROVE" | "REJECT"
  ) {
    if (busyId) return;

    let reason = "";

    if (action === "REJECT") {
      reason =
        window.prompt(
          "Enter rejection reason:"
        ) || "";

      if (!reason.trim()) {
        return;
      }
    }

    const message =
      action === "APPROVE"
        ? `Approve ${money(
            deposit.amountPaisa
          )} deposit for ${
            deposit.user?.username
          }?`
        : `Reject this deposit?`;

    if (!window.confirm(message)) {
      return;
    }

    setBusyId(deposit.id);

    try {
      const response =
        await fetch(
          `/api/admin/deposits/${deposit.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action,
              reason,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      setDeposits((current) =>
        current.map((item) =>
          item.id === deposit.id
            ? {
                ...item,
                ...data.deposit,
              }
            : item
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to review deposit."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left">
          <thead className="bg-[#f7f7ff]">
            <tr className="text-xs uppercase tracking-wider text-gray-500">
              <th className="px-5 py-4">
                User
              </th>

              <th className="px-5 py-4">
                Plan
              </th>

              <th className="px-5 py-4">
                Method
              </th>

              <th className="px-5 py-4">
                Amount
              </th>

              <th className="px-5 py-4">
                TID
              </th>

              <th className="px-5 py-4">
                Screenshot
              </th>

              <th className="px-5 py-4">
                Status
              </th>

              <th className="px-5 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {deposits.map((deposit) => {
              const busy =
                busyId === deposit.id;

              return (
                <tr
                  key={deposit.id}
                  className="border-t border-gray-100"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#111b58]">
                      {
                        deposit.user
                          ?.fullName
                      }
                    </p>

                    <p className="text-xs text-gray-500">
                      @
                      {
                        deposit.user
                          ?.username
                      }
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold">
                    {
                      deposit.plan
                        ?.name
                    }
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600">
                      {deposit.method}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-bold text-[#111b58]">
                      {money(
                        deposit.amountPaisa
                      )}
                    </p>

                    <p className="text-xs text-gray-400">
                      Pay:{" "}
                      {money(
                        deposit.exactAmountPaisa
                      )}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-mono text-sm">
                    {
                      deposit.transactionReference
                    }
                  </td>

                  <td className="px-5 py-4">
                    <a
                      href={
                        deposit.proofUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
                    >
                      <Eye size={15} />
                      Preview
                      <ExternalLink
                        size={13}
                      />
                    </a>
                  </td>

                  <td className="px-5 py-4">
                    <Status
                      status={
                        deposit.status
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    {deposit.status ===
                    "PENDING" ? (
                      <div className="flex gap-2">
                        <button
                          disabled={busy}
                          onClick={() =>
                            review(
                              deposit,
                              "APPROVE"
                            )
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-100 disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Check
                              size={14}
                            />
                          )}
                          Approve
                        </button>

                        <button
                          disabled={busy}
                          onClick={() =>
                            review(
                              deposit,
                              "REJECT"
                            )
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}

            {deposits.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-sm text-gray-500"
                >
                  No deposit requests
                  found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Status({
  status,
}: {
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED";
}) {
  const classes =
    status === "APPROVED"
      ? "bg-green-100 text-green-700"
      : status === "REJECTED"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}
    >
      {status}
    </span>
  );
}