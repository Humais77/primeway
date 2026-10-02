"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
} from "lucide-react";

type Investment = {
  id: string;
  amountPaisa: number;
  profitRateBps: number;
  frequency:
    | "DAILY"
    | "WEEKLY"
    | "MONTHLY";
  startDate: string;
  endDate: string;
  nextProfitAt: string;
  earnedProfitPaisa: number;
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";

  user?: {
    id: string;
    fullName: string;
    username: string;
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

export default function InvestmentsAdmin({
  initialInvestments,
}: {
  initialInvestments: Investment[];
}) {
  const [investments, setInvestments] =
    useState(initialInvestments);

  const [editing, setEditing] =
    useState<Investment | null>(null);

  const [form, setForm] = useState({
    amount: "",
    profitRate: "",
    frequency: "DAILY",
    status: "ACTIVE",
    earnedProfit: "",
  });

  function openEdit(
    investment: Investment
  ) {
    setEditing(investment);

    setForm({
      amount: String(
        investment.amountPaisa / 100
      ),
      profitRate: String(
        investment.profitRateBps / 100
      ),
      frequency:
        investment.frequency,
      status: investment.status,
      earnedProfit: String(
        investment.earnedProfitPaisa /
          100
      ),
    });
  }

  async function updateInvestment(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!editing) return;

    try {
      const response =
        await fetch(
          `/api/admin/investments/${editing.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              amountPaisa:
                Math.round(
                  Number(form.amount) *
                    100
                ),
              profitRateBps:
                Math.round(
                  Number(
                    form.profitRate
                  ) * 100
                ),
              frequency:
                form.frequency,
              status:
                form.status,
              earnedProfitPaisa:
                Math.round(
                  Number(
                    form.earnedProfit
                  ) * 100
                ),
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

      setInvestments(
        (current) =>
          current.map(
            (investment) =>
              investment.id ===
              editing.id
                ? {
                    ...investment,
                    ...data.investment,
                  }
                : investment
          )
      );

      setEditing(null);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update investment."
      );
    }
  }

  async function deleteInvestment(
    investment: Investment
  ) {
    if (
      !confirm(
        "Delete this investment record?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/admin/investments/${investment.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      setInvestments(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              investment.id
          )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete investment."
      );
    }
  }

  return (
    <>
      {editing && (
        <form
          onSubmit={updateInvestment}
          className="mb-7 rounded-3xl border border-[#dceedd] bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex justify-between">
            <div>
              <h2 className="text-xl font-black text-[#173b20]">
                Edit Investment
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Update investment amount, rate, profit and status.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditing(null)
              }
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-[#eff8f0] hover:text-[#2f7d32]"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Amount (PKR)"
              value={form.amount}
              type="number"
              onChange={(value) =>
                setForm({
                  ...form,
                  amount: value,
                })
              }
            />

            <Field
              label="Profit Rate (%)"
              value={form.profitRate}
              type="number"
              step="0.01"
              onChange={(value) =>
                setForm({
                  ...form,
                  profitRate: value,
                })
              }
            />

            <Field
              label="Earned Profit (PKR)"
              value={
                form.earnedProfit
              }
              type="number"
              step="0.01"
              onChange={(value) =>
                setForm({
                  ...form,
                  earnedProfit:
                    value,
                })
              }
            />

            <label>
              <span className="mb-2 block text-xs font-bold text-gray-600">
                Status
              </span>

              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status:
                      event.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </label>
          </div>

          <button className="mt-6 rounded-xl bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32]">
            Save Investment
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-[#dceedd] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-[#f4faf4] text-xs uppercase tracking-wider text-[#2f7d32]">
              <tr>
                <th className="px-5 py-4">
                  User
                </th>

                <th className="px-5 py-4">
                  Plan
                </th>

                <th className="px-5 py-4">
                  Amount
                </th>

                <th className="px-5 py-4">
                  Rate
                </th>

                <th className="px-5 py-4">
                  Earned
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
              {investments.map(
                (investment) => (
                  <tr
                    key={investment.id}
                    className="border-t border-[#edf4ed] transition hover:bg-[#f9fcf9]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#173b20]">
                        {
                          investment.user
                            ?.fullName
                        }
                      </p>

                      <p className="text-xs text-gray-500">
                        @
                        {
                          investment.user
                            ?.username
                        }
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-[#173b20]">
                      {
                        investment.plan
                          ?.name
                      }
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-[#173b20]">
                      {money(
                        investment.amountPaisa
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-[#45a94a]">
                      {investment.profitRateBps /
                        100}
                      %
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-[#45a94a]">
                      {money(
                        investment.earnedProfitPaisa
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <Status
                        status={
                          investment.status
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEdit(
                              investment
                            )
                          }
                          className="rounded-lg bg-[#eff8f0] p-2 text-[#2f7d32] transition hover:bg-[#e4f4e5]"
                          title="Edit investment"
                          aria-label="Edit investment"
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteInvestment(
                              investment
                            )
                          }
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          title="Delete investment"
                          aria-label="Delete investment"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {investments.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No investments
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Status({
  status,
}: {
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";
}) {
  const classes =
    status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : status === "COMPLETED"
        ? "bg-[#eff8f0] text-[#2f7d32]"
        : "bg-red-100 text-red-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}
    >
      {status}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-gray-600">
        {label}
      </span>

      <input
        required
        type={type}
        step={step}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
      />
    </label>
  );
}