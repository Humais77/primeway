"use client";

import {
  Loader2,
  Pencil,
  Plus,
  Power,
  X,
} from "lucide-react";

import { useState } from "react";

type Gateway =
  | "EASYPAISA"
  | "BANK"
  | "RAAST";

type Account = {
  id: string;
  gateway: Gateway;
  accountName: string;
  accountNumber: string;
  processingChargePaisa: number;
  isActive: boolean;
};

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString(
    "en-PK"
  )}`;
}

export default function PaymentAccountsAdmin({
  initialAccounts,
}: {
  initialAccounts: Account[];
}) {
  const [accounts, setAccounts] =
    useState(initialAccounts);

  const [editing, setEditing] =
    useState<Account | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    gateway: "EASYPAISA" as Gateway,
    accountName: "",
    accountNumber: "",
    processingCharge: "0",
    isActive: false,
  });

  function createAccount() {
    setEditing(null);

    setForm({
      gateway: "EASYPAISA",
      accountName: "",
      accountNumber: "",
      processingCharge: "0",
      isActive: false,
    });

    setShowForm(true);
  }

  function editAccount(
    account: Account
  ) {
    setEditing(account);

    setForm({
      gateway: account.gateway,
      accountName:
        account.accountName,
      accountNumber:
        account.accountNumber,
      processingCharge: String(
        account.processingChargePaisa /
          100
      ),
      isActive: account.isActive,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function save(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const payload = {
        gateway: form.gateway,
        accountName:
          form.accountName,
        accountNumber:
          form.accountNumber,
        processingChargePaisa:
          Math.round(
            Number(
              form.processingCharge
            ) * 100
          ),
        isActive: form.isActive,
      };

      const response =
        await fetch(
          editing
            ? `/api/admin/payment-accounts/${editing.id}`
            : "/api/admin/payment-accounts",
          {
            method: editing
              ? "PATCH"
              : "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      if (editing) {
        setAccounts((current) =>
          current.map((account) =>
            account.id ===
            editing.id
              ? data.account
              : account
          )
        );

        // If account became active,
        // deactivate other accounts
        // locally too.
        if (data.account.isActive) {
          setAccounts((current) =>
            current.map(
              (account) =>
                account.gateway ===
                  data.account.gateway &&
                account.id !==
                  data.account.id
                  ? {
                      ...account,
                      isActive:
                        false,
                    }
                  : account
            )
          );
        }
      } else {
        setAccounts((current) => {
          const next =
            data.account.isActive
              ? current.map(
                  (account) =>
                    account.gateway ===
                    data.account.gateway
                      ? {
                          ...account,
                          isActive:
                            false,
                        }
                      : account
                )
              : current;

          return [
            ...next,
            data.account,
          ];
        });
      }

      closeForm();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save account."
      );
    } finally {
      setLoading(false);
    }
  }

  async function activate(
    account: Account
  ) {
    if (
      !confirm(
        `Make this the active ${account.gateway} account?`
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/admin/payment-accounts/${account.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              isActive:
                !account.isActive,
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

      setAccounts((current) =>
        current.map((item) =>
          item.gateway ===
            data.account.gateway
            ? {
                ...item,
                isActive:
                  item.id ===
                  data.account.id
                    ? data.account
                        .isActive
                    : false,
              }
            : item
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to change account."
      );
    }
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          onClick={createAccount}
          className="flex items-center gap-2 rounded-xl bg-[#45a94a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-200 transition hover:bg-[#2f7d32]"
        >
          <Plus size={18} />
          Add Payment Account
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeForm}
        >
          <form
            onSubmit={save}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="my-8 w-full max-w-2xl rounded-3xl border border-[#dceedd] bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[#173b20]">
                  {editing
                    ? "Edit Payment Account"
                    : "Add Payment Account"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Only one account per
                  gateway can be active.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-[#eff8f0] hover:text-[#2f7d32]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  Payment Gateway
                </span>

                <select
                  value={form.gateway}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      gateway:
                        event.target
                          .value as Gateway,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                >
                  <option value="EASYPAISA">
                    EasyPaisa
                  </option>

                  <option value="BANK">
                    Bank Account
                  </option>

                  <option value="RAAST">
                    Raast
                  </option>
                </select>
              </label>

              <Input
                label="Account Name"
                value={
                  form.accountName
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    accountName:
                      value,
                  })
                }
              />

              <Input
                label="Account Number"
                value={
                  form.accountNumber
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    accountNumber:
                      value,
                  })
                }
              />

              <Input
                label="Processing Charge (PKR)"
                type="number"
                step="0.01"
                value={
                  form.processingCharge
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    processingCharge:
                      value,
                  })
                }
              />
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm font-bold text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm({
                    ...form,
                    isActive:
                      event.target
                        .checked,
                  })
                }
                className="h-4 w-4 accent-[#45a94a]"
              />

              Make this account active
            </label>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-[#dceedd] hover:bg-[#f4faf4]"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#45a94a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2f7d32] disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {editing
                  ? "Update Account"
                  : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              account.isActive
                ? "border-[#b9dfbb] shadow-green-100/50"
                : "border-[#dceedd]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full border border-[#dceedd] bg-[#eff8f0] px-3 py-1 text-xs font-bold text-[#2f7d32]">
                  {account.gateway}
                </span>

                <h3 className="mt-4 text-lg font-black text-[#173b20]">
                  {
                    account.accountName
                  }
                </h3>

                <p className="mt-1 font-mono text-sm text-gray-500">
                  {
                    account.accountNumber
                  }
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  account.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {account.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-[#e7efe7] bg-[#f8fbf8] p-4">
              <p className="text-xs text-gray-500">
                Processing Charge
              </p>

              <p className="mt-1 font-bold text-[#173b20]">
                {money(
                  account.processingChargePaisa
                )}
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() =>
                  editAccount(account)
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#eff8f0] py-3 text-xs font-bold text-[#2f7d32] transition hover:bg-[#e4f4e5]"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                onClick={() =>
                  activate(account)
                }
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition ${
                  account.isActive
                    ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                <Power size={15} />

                {account.isActive
                  ? "Active"
                  : "Activate"}
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-[#cfe5d0] bg-white p-12 text-center text-sm text-gray-500">
            No payment accounts created yet.
          </div>
        )}
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