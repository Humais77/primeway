"use client";

import {
  Percent,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { FormEvent, useEffect, useState } from "react";

type ReferralSettings = {
  level1Percentage: number;
  level2Percentage: number;
  level1BonusBps: number;
  level2BonusBps: number;
  updatedAt?: string;
};

export default function ReferralSettings() {
  const [level1, setLevel1] =
    useState("13");

  const [level2, setLevel2] =
    useState("5");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/settings/referrals",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load referral settings."
        );
      }

      setLevel1(
        String(
          data.settings
            .level1Percentage
        )
      );

      setLevel2(
        String(
          data.settings
            .level2Percentage
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load referral settings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSuccess("");
    setError("");

    const level1Percentage =
      Number(level1);

    const level2Percentage =
      Number(level2);

    if (
      !Number.isFinite(
        level1Percentage
      ) ||
      level1Percentage < 0 ||
      level1Percentage > 100
    ) {
      setError(
        "Level 1 percentage must be between 0 and 100."
      );

      return;
    }

    if (
      !Number.isFinite(
        level2Percentage
      ) ||
      level2Percentage < 0 ||
      level2Percentage > 100
    ) {
      setError(
        "Level 2 percentage must be between 0 and 100."
      );

      return;
    }

    try {
      setSaving(true);

      const response =
        await fetch(
          "/api/admin/settings/referrals",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              level1Percentage,
              level2Percentage,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update referral settings."
        );
      }

      setLevel1(
        String(
          data.settings
            .level1Percentage
        )
      );

      setLevel2(
        String(
          data.settings
            .level2Percentage
        )
      );

      setSuccess(
        "Referral commission settings updated successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update referral settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-[#dceedd] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Loader2
            size={18}
            className="animate-spin text-[#18B152]"
          />

          Loading referral settings...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#dceedd] bg-white shadow-sm">
      {/* Header */}

      <div className="border-b border-[#edf4ed] px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-[#EAF8F0]
              text-[#18B152]
            "
          >
            <Percent size={20} />
          </div>

          <div>
            <h2 className="text-lg font-black text-[#173b20]">
              Referral Commission
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Control the commission percentage
              paid on successful referral investments.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* Level 1 */}

          <div>
            <label
              htmlFor="level1Percentage"
              className="mb-2 block text-sm font-bold text-[#173b20]"
            >
              Level 1 Commission
            </label>

            <div className="relative">
              <input
                id="level1Percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={level1}
                onChange={(event) =>
                  setLevel1(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[#dceedd]
                  bg-white
                  px-4
                  pr-12
                  text-sm
                  font-bold
                  text-[#173b20]
                  outline-none
                  transition
                  focus:border-[#18B152]
                  focus:ring-2
                  focus:ring-[#18B152]/10
                "
                required
              />

              <span
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  font-black
                  text-[#18B152]
                "
              >
                %
              </span>
            </div>

            <p className="mt-2 text-[11px] text-gray-400">
              Applied while the referrer is Level 1.
            </p>
          </div>

          {/* Level 2 */}

          <div>
            <label
              htmlFor="level2Percentage"
              className="mb-2 block text-sm font-bold text-[#173b20]"
            >
              Level 2 Commission
            </label>

            <div className="relative">
              <input
                id="level2Percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={level2}
                onChange={(event) =>
                  setLevel2(
                    event.target.value
                  )
                }
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[#dceedd]
                  bg-white
                  px-4
                  pr-12
                  text-sm
                  font-bold
                  text-[#173b20]
                  outline-none
                  transition
                  focus:border-[#18B152]
                  focus:ring-2
                  focus:ring-[#18B152]/10
                "
                required
              />

              <span
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  font-black
                  text-[#18B152]
                "
              >
                %
              </span>
            </div>

            <p className="mt-2 text-[11px] text-gray-400">
              Applied after the referrer reaches Level 2.
            </p>
          </div>
        </div>

        {/* Explanation */}

        <div className="mt-5 rounded-xl bg-[#f5faf6] px-4 py-3">
          <p className="text-xs font-bold text-[#173b20]">
            How it works
          </p>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            A new user starts at Level 1. After
            their first successful referral investment,
            they become Level 2. Changing these values
            affects future referral commissions only.
            Previously credited commissions remain unchanged.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* Success */}

        {success && (
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-xs font-semibold text-green-700">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0"
            />

            <span>{success}</span>
          </div>
        )}

        {/* Save */}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#18B152]
              px-5
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#149b47]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}