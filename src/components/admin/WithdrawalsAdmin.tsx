"use client";

import { useState } from "react";

import {
  CheckCircle2,
  Clock3,
  Eye,
  Save,
  XCircle,
} from "lucide-react";

type WithdrawalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

type Withdrawal = {
  id: string;
  amountPaisa: number;
  method: string;
  accountDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    iban?: string;
  };
  status: WithdrawalStatus;
  rejectionReason?: string | null;
  createdAt: string | Date;
  reviewedAt?: string | Date | null;

  user?: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  };

  reviewer?: {
    id: string;
    fullName: string;
  };
};

function money(paisa: number) {
  return `Rs ${(
    paisa / 100
  ).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function date(value: string | Date) {
  return new Date(value).toLocaleString(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export default function WithdrawalsAdmin({
  initialWithdrawals,
  initialMinWithdrawalPaisa,
}: {
  initialWithdrawals: Withdrawal[];
  initialMinWithdrawalPaisa: number;
}) {
  const [withdrawals, setWithdrawals] =
    useState(initialWithdrawals);

  const [minAmount, setMinAmount] =
    useState(
      String(
        initialMinWithdrawalPaisa / 100
      )
    );

  const [saving, setSaving] =
    useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  async function saveMinimum() {
    const paisa = Math.round(
      Number(minAmount) * 100
    );

    if (
      !Number.isInteger(paisa) ||
      paisa <= 0
    ) {
      alert(
        "Enter a valid minimum withdrawal amount."
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          "/api/admin/withdrawal-settings",
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              minWithdrawalPaisa:
                paisa,
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

      alert(
        "Minimum withdrawal updated successfully."
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update setting."
      );
    } finally {
      setSaving(false);
    }
  }

  async function processWithdrawal(
    withdrawal: Withdrawal,
    status:
      | "APPROVED"
      | "REJECTED"
  ) {
    let rejectionReason = "";

    if (status === "REJECTED") {
      rejectionReason =
        window.prompt(
          "Enter the rejection reason:"
        )?.trim() || "";

      if (!rejectionReason) {
        return;
      }
    }

    const confirmMessage =
      status === "APPROVED"
        ? `Confirm that you have manually sent ${money(
            withdrawal.amountPaisa
          )} to ${withdrawal.accountDetails.accountNumber}?`
        : "Reject this withdrawal and refund the amount to the user's balance?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setProcessingId(
      withdrawal.id
    );

    try {
      const response =
        await fetch(
          `/api/admin/withdrawals/${withdrawal.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              status,
              rejectionReason,
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

      setWithdrawals(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              withdrawal.id
                ? {
                    ...item,
                    ...data.withdrawal,
                  }
                : item
          )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to process withdrawal."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-7">
      {/* MINIMUM WITHDRAWAL SETTING */}
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#111b58]">
              Withdrawal Settings
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set the minimum amount a user can withdraw.
            </p>
          </div>

          <div className="flex w-full gap-3 md:max-w-md">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-bold text-gray-600">
                Minimum Withdrawal (PKR)
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                value={minAmount}
                onChange={(event) =>
                  setMinAmount(
                    event.target.value
                  )
                }
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={saveMinimum}
              disabled={saving}
              className="mt-6 flex h-11 items-center gap-2 rounded-xl bg-[#4020bd] px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              <Save size={16} />

              {saving
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* WITHDRAWALS */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-xl font-black text-[#111b58]">
            Withdrawal Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manually process user withdrawal requests.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="bg-[#f7f7ff] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Method
                </th>

                <th className="px-5 py-4">
                  Account
                </th>

                <th className="px-5 py-4">
                  Date
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
              {withdrawals.map(
                (withdrawal) => {
                  const details =
                    withdrawal.accountDetails;

                  return (
                    <tr
                      key={withdrawal.id}
                      className="border-t border-gray-100"
                    >
                      <td className="px-5 py-5">
                        <p className="font-bold text-[#111b58]">
                          {
                            withdrawal.user
                              ?.fullName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          @
                          {
                            withdrawal.user
                              ?.username
                          }
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-black text-[#111b58]">
                          {money(
                            withdrawal.amountPaisa
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600">
                          {
                            withdrawal.method
                          }
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm font-bold text-gray-700">
                          {
                            details.accountName
                          }
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {
                            details.accountNumber
                          }
                        </p>

                        {details.bankName && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              details.bankName
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5 text-xs text-gray-500">
                        {date(
                          withdrawal.createdAt
                        )}
                      </td>

                      <td className="px-5 py-5">
                        {withdrawal.status ===
                          "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-600">
                            <Clock3
                              size={13}
                            />
                            Pending
                          </span>
                        )}

                        {withdrawal.status ===
                          "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                            <CheckCircle2
                              size={13}
                            />
                            Approved
                          </span>
                        )}

                        {withdrawal.status ===
                          "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                            <XCircle
                              size={13}
                            />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex gap-2">
                          {withdrawal.status ===
                            "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={
                                  processingId ===
                                  withdrawal.id
                                }
                                onClick={() =>
                                  processWithdrawal(
                                    withdrawal,
                                    "APPROVED"
                                  )
                                }
                                className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-100 disabled:opacity-50"
                              >
                                <CheckCircle2
                                  size={14}
                                />
                                Approve
                              </button>

                              <button
                                type="button"
                                disabled={
                                  processingId ===
                                  withdrawal.id
                                }
                                onClick={() =>
                                  processWithdrawal(
                                    withdrawal,
                                    "REJECTED"
                                  )
                                }
                                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                <XCircle
                                  size={14}
                                />
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                JSON.stringify(
                                  details,
                                  null,
                                  2
                                )
                              )
                            }
                            className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                            title="View account details"
                          >
                            <Eye
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}

              {withdrawals.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-gray-500"
                  >
                    No withdrawal requests
                    found.
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