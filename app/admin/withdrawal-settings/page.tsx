
"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

type Settings = {
  minWithdrawalPaisa: number;
  defaultDailyLimitPaisa: number | null;
  defaultLifetimeLimitPaisa: number | null;
};

export default function WithdrawalSettingsAdmin() {
  const [minimum, setMinimum] = useState("500");
  const [dailyLimit, setDailyLimit] = useState("");
  const [lifetimeLimit, setLifetimeLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          "/api/admin/withdrawal-settings",
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load settings.");
        }

        const setting = data.setting as Settings;

        if (!cancelled) {
          setMinimum(String(setting.minWithdrawalPaisa / 100));
          setDailyLimit(
            setting.defaultDailyLimitPaisa == null
              ? ""
              : String(setting.defaultDailyLimitPaisa / 100)
          );
          setLifetimeLimit(
            setting.defaultLifetimeLimitPaisa == null
              ? ""
              : String(setting.defaultLifetimeLimitPaisa / 100)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function toPaisa(value: string, allowEmpty: boolean) {
    if (allowEmpty && value.trim() === "") return null;

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Enter a positive amount or leave an optional limit empty.");
    }

    const paisa = Math.round(amount * 100);

    if (!Number.isSafeInteger(paisa) || paisa <= 0) {
      throw new Error("The entered amount is invalid.");
    }

    return paisa;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const body = {
        minWithdrawalPaisa: toPaisa(minimum, false),
        defaultDailyLimitPaisa: toPaisa(dailyLimit, true),
        defaultLifetimeLimitPaisa: toPaisa(lifetimeLimit, true),
      };

      const response = await fetch("/api/admin/withdrawal-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save settings.");
      }

      setMessage("Withdrawal settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Loading withdrawal settings...
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="space-y-5 rounded-3xl border border-[#dceedd] bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-black text-[#173b20]">
          Global Withdrawal Settings
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          These defaults apply to plans without custom limits. Daily limits
          reset at midnight Pakistan time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AmountField
          label="Minimum Withdrawal (PKR)"
          value={minimum}
          onChange={setMinimum}
          required
        />
        <AmountField
          label="Default Daily Limit (PKR)"
          value={dailyLimit}
          onChange={setDailyLimit}
          placeholder="No global daily cap"
        />
        <AmountField
          label="Default Lifetime Limit (PKR)"
          value={lifetimeLimit}
          onChange={setLifetimeLimit}
          placeholder="No global lifetime cap"
        />
      </div>

      <p className="text-xs leading-5 text-gray-500">
        Leave a daily or lifetime limit empty to allow no cap at that level.
        Individual user and plan limits can still restrict withdrawals.
      </p>

      {message && (
        <p className="text-sm font-semibold text-green-700">{message}</p>
      )}
      {error && (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-[#45a94a] px-5 py-3 text-sm font-bold text-white hover:bg-[#2f7d32] disabled:opacity-60"
      >
        {saving ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {saving ? "Saving..." : "Save Withdrawal Settings"}
      </button>
    </form>
  );
}

function AmountField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-gray-600">
        {label}
      </span>
      <input
        type="number"
        min="0.01"
        step="0.01"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:border-[#45a94a]"
      />
    </label>
  );
}