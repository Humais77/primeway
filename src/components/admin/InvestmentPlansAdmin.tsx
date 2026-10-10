"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X, Loader2, Power } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  minAmountPaisa: number;
  maxAmountPaisa: number;
  profitRateBps: number;
  referralBonusBps: number;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  durationDays: number;
  minWithdrawalPaisa: number | null;
  isActive: boolean;
  customWithdrawalLimitsEnabled: boolean;
  dailyWithdrawalLimitPaisa: number | null;
  lifetimeWithdrawalLimitPaisa: number | null;
};

type PlanForm = {
  name: string;
  minAmount: string;
  maxAmount: string;
  profitRate: string;
  referralBonus: string;
  frequency: Plan["frequency"];
  durationDays: string;
  minWithdrawal: string;
  isActive: boolean;
  customWithdrawalLimitsEnabled: boolean;
  dailyWithdrawalLimit: string;
  lifetimeWithdrawalLimit: string;
};

const emptyForm: PlanForm = {
  name: "",
  minAmount: "",
  maxAmount: "",
  profitRate: "",
  referralBonus: "",
  frequency: "DAILY",
  durationDays: "30",
  minWithdrawal: "",
  isActive: true,
  customWithdrawalLimitsEnabled: false,
  dailyWithdrawalLimit: "",
  lifetimeWithdrawalLimit: "",
};

function money(paisa: number | null | undefined) {
  if (paisa == null) return "No limit";

  return `Rs ${(paisa / 100).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;
}

function amountToPaisa(value: string): number | null {
  if (value.trim() === "") return null;

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return NaN;

  const paisa = Math.round(amount * 100);

  return Number.isSafeInteger(paisa) ? paisa : NaN;
}

function formatRate(bps: number) {
  return `${(bps / 100).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}%`;
}

export default function InvestmentPlansAdmin({
  initialPlans,
}: {
  initialPlans: Plan[];
}) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<PlanForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm({ ...emptyForm });
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
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
      minWithdrawal: plan.minWithdrawalPaisa == null ? "" : String(plan.minWithdrawalPaisa / 100),
      isActive: plan.isActive,
      customWithdrawalLimitsEnabled:
        plan.customWithdrawalLimitsEnabled ?? false,
      dailyWithdrawalLimit:
        plan.dailyWithdrawalLimitPaisa == null
          ? ""
          : String(plan.dailyWithdrawalLimitPaisa / 100),
      lifetimeWithdrawalLimit:
        plan.lifetimeWithdrawalLimitPaisa == null
          ? ""
          : String(plan.lifetimeWithdrawalLimitPaisa / 100),
    });
    setModalOpen(true);
  }

  function buildPayload() {
    const minAmountPaisa = amountToPaisa(form.minAmount);
    const maxAmountPaisa = amountToPaisa(form.maxAmount);
    const minWithdrawalPaisa = amountToPaisa(form.minWithdrawal);
    const dailyWithdrawalLimitPaisa =
      amountToPaisa(form.dailyWithdrawalLimit);
    const lifetimeWithdrawalLimitPaisa =
      amountToPaisa(form.lifetimeWithdrawalLimit);

    if (!form.name.trim()) {
      throw new Error("Plan name is required.");
    }

    if (
      minAmountPaisa === null ||
      maxAmountPaisa === null ||
      Number.isNaN(minAmountPaisa) ||
      Number.isNaN(maxAmountPaisa) ||
      minAmountPaisa > maxAmountPaisa
    ) {
      throw new Error(
        "Enter valid minimum and maximum amounts. The minimum cannot exceed the maximum."
      );
    }

    if (
      !form.profitRate.trim() ||
      !Number.isFinite(Number(form.profitRate)) ||
      Number(form.profitRate) < 0 ||
      !form.referralBonus.trim() ||
      !Number.isFinite(Number(form.referralBonus)) ||
      Number(form.referralBonus) < 0
    ) {
      throw new Error("Profit and referral rates must be valid percentages.");
    }

    if (
      !Number.isInteger(Number(form.durationDays)) ||
      Number(form.durationDays) <= 0
    ) {
      throw new Error("Duration must be a positive number of days.");
    }

    if (
      Number.isNaN(minWithdrawalPaisa) ||
      Number.isNaN(dailyWithdrawalLimitPaisa) ||
      Number.isNaN(lifetimeWithdrawalLimitPaisa)
    ) {
      throw new Error(
        "Custom withdrawal limits must be positive amounts or left empty to inherit global limits."
      );
    }

    return {
      name: form.name.trim(),
      minAmountPaisa,
      maxAmountPaisa,
      profitRateBps: Math.round(Number(form.profitRate) * 100),
      referralBonusBps: Math.round(Number(form.referralBonus) * 100),
      frequency: form.frequency,
      durationDays: Number(form.durationDays),
      isActive: form.isActive,
      minWithdrawalPaisa,
      customWithdrawalLimitsEnabled:
        form.customWithdrawalLimitsEnabled,
      dailyWithdrawalLimitPaisa,
      lifetimeWithdrawalLimitPaisa,
    };
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = buildPayload();
      const url = editing
        ? `/api/admin/investment-plans/${editing.id}`
        : "/api/admin/investment-plans";

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save plan.");
      }

      const savedPlan = data.plan as Plan;

      setPlans((current) =>
        editing
          ? current.map((plan) =>
              plan.id === editing.id ? savedPlan : plan
            )
          : [savedPlan, ...current]
      );

      closeModal();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to save plan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(plan: Plan) {
    if (togglingId) return;

    setTogglingId(plan.id);

    try {
      const response = await fetch(
        `/api/admin/investment-plans/${plan.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !plan.isActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update plan.");
      }

      setPlans((current) =>
        current.map((item) =>
          item.id === plan.id ? { ...item, ...data.plan } : item
        )
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to update plan."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function deletePlan(plan: Plan) {
    if (!confirm(`Delete investment plan "${plan.name}"?`)) return;

    setDeletingId(plan.id);

    try {
      const response = await fetch(
        `/api/admin/investment-plans/${plan.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete plan.");
      }

      setPlans((current) =>
        current.filter((item) => item.id !== plan.id)
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to delete plan."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function update<K extends keyof PlanForm>(
    key: K,
    value: PlanForm[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-5">
      {modalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4"
          onClick={closeModal}
        >
          <form
            onSubmit={submit}
            onClick={(event) => event.stopPropagation()}
            className="my-6 w-full max-w-3xl rounded-3xl border border-[#dceedd] bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-[#173b20]">
                  {editing ? "Edit Investment Plan" : "Create Investment Plan"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure plan returns and withdrawal restrictions.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Plan Name"
                value={form.name}
                onChange={(value) => update("name", value)}
              />
              <Field
                label="Minimum Investment (PKR)"
                type="number"
                value={form.minAmount}
                onChange={(value) => update("minAmount", value)}
              />
              <Field
                label="Maximum Investment (PKR)"
                type="number"
                value={form.maxAmount}
                onChange={(value) => update("maxAmount", value)}
              />
              <Field
                label="Profit Rate (%)"
                type="number"
                value={form.profitRate}
                onChange={(value) => update("profitRate", value)}
              />
              <Field
                label="Referral Bonus (%)"
                type="number"
                value={form.referralBonus}
                onChange={(value) => update("referralBonus", value)}
              />
              <Field
                label="Duration (days)"
                type="number"
                value={form.durationDays}
                onChange={(value) => update("durationDays", value)}
              />

              <label>
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  Profit Frequency
                </span>
                <select
                  value={form.frequency}
                  onChange={(event) =>
                    update(
                      "frequency",
                      event.target.value as Plan["frequency"]
                    )
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </label>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#173b20]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="accent-[#45a94a]"
              />
              Plan Active
            </label>

            <div className="mt-5 rounded-2xl border border-[#dceedd] bg-white p-4">
              <h3 className="font-bold text-[#173b20]">Plan-specific minimum withdrawal</h3>
              <p className="mt-1 mb-3 text-xs leading-5 text-gray-500">
                This minimum applies only to withdrawals assigned to this plan. Leave empty to use the global minimum.
              </p>
              <Field label="Minimum Withdrawal (PKR)" type="number" required={false} value={form.minWithdrawal} onChange={(value) => update("minWithdrawal", value)} />
            </div>

            <div className="mt-6 rounded-2xl border border-[#dceedd] bg-[#f8fcf8] p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.customWithdrawalLimitsEnabled}
                  onChange={(event) =>
                    update(
                      "customWithdrawalLimitsEnabled",
                      event.target.checked
                    )
                  }
                  className="mt-1 accent-[#45a94a]"
                />
                <span>
                  <span className="block font-bold text-[#173b20]">
                    Enable custom withdrawal limits for this plan
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">
                    This toggle controls daily and lifetime caps only. Minimum withdrawal is configured separately above.
                  </span>
                </span>
              </label>

              <div
                className={`mt-4 grid gap-4 md:grid-cols-2 ${
                  !form.customWithdrawalLimitsEnabled
                    ? "opacity-50"
                    : ""
                }`}
              >
                <Field
                  label="Daily Withdrawal Limit (PKR)"
                  type="number"
                  required={false}
                  value={form.dailyWithdrawalLimit}
                  disabled={!form.customWithdrawalLimitsEnabled}
                  onChange={(value) =>
                    update("dailyWithdrawalLimit", value)
                  }
                />
                <Field
                  label="Lifetime Withdrawal Limit (PKR)"
                  type="number"
                  required={false}
                  value={form.lifetimeWithdrawalLimit}
                  disabled={!form.customWithdrawalLimitsEnabled}
                  onChange={(value) =>
                    update("lifetimeWithdrawalLimit", value)
                  }
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Leave either field empty to inherit the global setting for
                that limit. Limits are tracked against pending and approved
                withdrawals assigned to the plan. Rejected requests are
                excluded.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#45a94a] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving..." : editing ? "Save Changes" : "Create Plan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#173b20]">
            Investment Plans
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage investment terms and withdrawal allowances.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#45a94a] px-5 text-sm font-bold text-white hover:bg-[#2f7d32]"
        >
          <Plus size={17} />
          Create Plan
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#dceedd] bg-white shadow-sm">
        <table className="w-full min-w-[1150px] text-left">
          <thead className="bg-[#f4faf4] text-xs uppercase text-[#2f7d32]">
            <tr>
              <th className="px-5 py-4">Plan</th>
              <th className="px-5 py-4">Investment Range</th>
              <th className="px-5 py-4">Profit</th>
              <th className="px-5 py-4">Duration</th>
              <th className="px-5 py-4">Minimum Withdrawal</th>
              <th className="px-5 py-4">Daily Limit</th>
              <th className="px-5 py-4">Lifetime Limit</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="border-t border-[#edf4ed] hover:bg-[#f9fcf9]"
              >
                <td className="px-5 py-4">
                  <p className="font-bold text-[#173b20]">{plan.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Referral: {formatRate(plan.referralBonusBps)}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {money(plan.minAmountPaisa)} – {money(plan.maxAmountPaisa)}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {formatRate(plan.profitRateBps)} / {plan.frequency.toLowerCase()}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {plan.durationDays} days
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[#173b20]">
                  {plan.minWithdrawalPaisa == null ? "Global default" : money(plan.minWithdrawalPaisa)}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {plan.customWithdrawalLimitsEnabled
                    ? money(plan.dailyWithdrawalLimitPaisa)
                    : "Global default"}
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">
                  {plan.customWithdrawalLimitsEnabled
                    ? money(plan.lifetimeWithdrawalLimitPaisa)
                    : "Global default"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      plan.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Edit plan"
                      onClick={() => openEdit(plan)}
                      className="rounded-lg border border-[#dceedd] bg-[#eff8f0] p-2 text-[#2f7d32]"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title={plan.isActive ? "Deactivate plan" : "Activate plan"}
                      disabled={togglingId === plan.id}
                      onClick={() => togglePlan(plan)}
                      className="rounded-lg border border-[#dceedd] bg-[#f4faf4] p-2 text-[#45a94a] disabled:opacity-50"
                    >
                      {togglingId === plan.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Power size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Delete plan"
                      disabled={deletingId === plan.id}
                      onClick={() => deletePlan(plan)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 disabled:opacity-50"
                    >
                      {deletingId === plan.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {plans.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-14 text-center text-sm text-gray-500"
                >
                  No investment plans have been created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-gray-600">
        {label}
      </span>
      <input
        required={required}
        disabled={disabled}
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#45a94a] disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </label>
  );
}
