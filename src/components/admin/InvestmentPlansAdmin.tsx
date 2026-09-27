"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  X,
  Loader2,
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  minAmountPaisa: number;
  maxAmountPaisa: number;
  profitRateBps: number;
  referralBonusBps: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  durationDays: number;
  isActive: boolean;
};

function formatPKR(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-PK")}`;
}

export default function InvestmentPlansAdmin({
  initialPlans,
}: {
  initialPlans: Plan[];
}) {
  const [plans, setPlans] = useState(initialPlans);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  // Per-row in-flight tracking.
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    minAmount: "",
    maxAmount: "",
    profitRate: "",
    referralBonus: "14",
    frequency: "DAILY",
    durationDays: "85",
    isActive: true,
  });

  function openCreate() {
    setEditing(null);

    setForm({
      name: "",
      minAmount: "",
      maxAmount: "",
      profitRate: "",
      referralBonus: "14",
      frequency: "DAILY",
      durationDays: "85",
      isActive: true,
    });

    setShowForm(true);
  }

  function openEdit(plan: Plan) {
    setEditing(plan);

    setForm({
      name: plan.name,
      minAmount: String(plan.minAmountPaisa / 100),
      maxAmount: String(plan.maxAmountPaisa / 100),
      profitRate: String(plan.profitRateBps / 100),
      referralBonus: String(plan.referralBonusBps / 100),
      frequency: plan.frequency,
      durationDays: String(plan.durationDays),
      isActive: plan.isActive,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        minAmountPaisa: Math.round(Number(form.minAmount) * 100),
        maxAmountPaisa: Math.round(Number(form.maxAmount) * 100),
        profitRateBps: Math.round(Number(form.profitRate) * 100),
        referralBonusBps: Math.round(Number(form.referralBonus) * 100),
        frequency: form.frequency,
        durationDays: Number(form.durationDays),
        isActive: form.isActive,
      };

      const response = await fetch(
        editing
          ? `/api/admin/investment-plans/${editing.id}`
          : "/api/admin/investment-plans",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      if (editing) {
        setPlans((current) =>
          current.map((plan) =>
            plan.id === editing.id ? data.plan : plan
          )
        );
      } else {
        setPlans((current) => [...current, data.plan]);
      }

      closeForm();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function togglePlan(plan: Plan) {
    if (togglingId === plan.id) return;

    setTogglingId(plan.id);

    try {
      const response = await fetch(
        `/api/admin/investment-plans/${plan.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: plan.name,
            minAmountPaisa: plan.minAmountPaisa,
            maxAmountPaisa: plan.maxAmountPaisa,
            profitRateBps: plan.profitRateBps,
            referralBonusBps: plan.referralBonusBps,
            frequency: plan.frequency,
            durationDays: plan.durationDays,
            isActive: !plan.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setPlans((current) =>
        current.map((item) =>
          item.id === plan.id ? data.plan : item
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update plan."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function deletePlan(plan: Plan) {
    if (deletingId === plan.id) return;

    if (!confirm(`Delete ${plan.name}?`)) {
      return;
    }

    setDeletingId(plan.id);

    try {
      const response = await fetch(
        `/api/admin/investment-plans/${plan.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setPlans((current) =>
        current.filter((item) => item.id !== plan.id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete plan."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* TOOLBAR */}
      <div className="mb-5 flex justify-end">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-[#4020bd] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:opacity-90"
        >
          <Plus size={18} />
          Create Plan
        </button>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeForm}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-[#111b58]">
                  {editing
                    ? "Edit Investment Plan"
                    : "Create Investment Plan"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {editing
                    ? "Update this plan's terms."
                    : "Define a new Prime Way investment plan."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Plan Name"
                value={form.name}
                onChange={(value) =>
                  setForm({ ...form, name: value })
                }
              />

              <Input
                label="Minimum Amount (PKR)"
                type="number"
                value={form.minAmount}
                onChange={(value) =>
                  setForm({ ...form, minAmount: value })
                }
              />

              <Input
                label="Maximum Amount (PKR)"
                type="number"
                value={form.maxAmount}
                onChange={(value) =>
                  setForm({ ...form, maxAmount: value })
                }
              />

              <Input
                label="Profit Rate (%)"
                type="number"
                step="0.01"
                value={form.profitRate}
                onChange={(value) =>
                  setForm({ ...form, profitRate: value })
                }
              />

              <Input
                label="Referral Bonus (%)"
                type="number"
                step="0.01"
                value={form.referralBonus}
                onChange={(value) =>
                  setForm({ ...form, referralBonus: value })
                }
              />

              <Input
                label="Duration (Days)"
                type="number"
                value={form.durationDays}
                onChange={(value) =>
                  setForm({ ...form, durationDays: value })
                }
              />

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  Frequency
                </span>

                <select
                  value={form.frequency}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      frequency: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-purple-500"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </label>

              <label className="flex items-center gap-3 pt-7 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      isActive: event.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Active Plan
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#4020bd] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {loading && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {loading
                  ? "Saving..."
                  : editing
                    ? "Update Plan"
                    : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#f7f7ff]">
              <tr className="text-xs uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Investment</th>
                <th className="px-5 py-4">Profit</th>
                <th className="px-5 py-4">Referral</th>
                <th className="px-5 py-4">Duration</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {plans.map((plan) => {
                const isToggling = togglingId === plan.id;
                const isDeleting = deletingId === plan.id;
                const rowBusy = isToggling || isDeleting;

                return (
                  <tr
                    key={plan.id}
                    className={`border-t border-gray-100 transition ${
                      rowBusy ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-[#111b58]">
                      {plan.name}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {formatPKR(plan.minAmountPaisa)}
                      {" - "}
                      {formatPKR(plan.maxAmountPaisa)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-green-600">
                      {plan.profitRateBps / 100}%
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-orange-500">
                      {plan.referralBonusBps / 100}%
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {plan.durationDays} days
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => togglePlan(plan)}
                        disabled={rowBusy}
                        title={
                          plan.isActive
                            ? "Deactivate plan"
                            : "Activate plan"
                        }
                        aria-label={
                          plan.isActive
                            ? "Deactivate plan"
                            : "Activate plan"
                        }
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          plan.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {isToggling && (
                          <Loader2
                            size={12}
                            className="animate-spin"
                          />
                        )}
                        {plan.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(plan)}
                          disabled={rowBusy}
                          title="Edit plan"
                          aria-label="Edit plan"
                          className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => togglePlan(plan)}
                          disabled={rowBusy}
                          title={
                            plan.isActive
                              ? "Deactivate plan"
                              : "Activate plan"
                          }
                          aria-label={
                            plan.isActive
                              ? "Deactivate plan"
                              : "Activate plan"
                          }
                          className="rounded-lg bg-purple-50 p-2 text-purple-600 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isToggling ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePlan(plan)}
                          disabled={rowBusy}
                          title="Delete plan"
                          aria-label="Delete plan"
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {plans.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No investment plans created yet.
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

function Input({
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
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-gray-600">
        {label}
      </span>

      <input
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-purple-500"
      />
    </label>
  );
}