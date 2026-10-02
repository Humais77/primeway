"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Power,
  X,
  Plus,
  Loader2,
} from "lucide-react";

type User = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  referralCode: string;
  balancePaisa: number;
  totalInvestmentPaisa: number;
  totalProfitPaisa: number;
  totalReferralPaisa: number;
  totalWithdrawnPaisa: number;
  isActive: boolean;
};

function money(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-PK")}`;
}

const emptyCreateForm = {
  fullName: "",
  username: "",
  email: "",
  role: "USER",
  balance: "",
  password: "",
  isActive: true,
};

const emptyEditForm = {
  fullName: "",
  username: "",
  email: "",
  role: "USER",
  balance: "",
  password: "",
  isActive: true,
};

export default function UsersAdmin({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState(initialUsers);

  const [editing, setEditing] = useState<User | null>(null);

  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    ...emptyCreateForm,
  });
  const [creatingSaving, setCreatingSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [saving, setSaving] = useState(false);

  // Per-row in-flight tracking so multiple rows can be operated on
  // independently without blocking each other.
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    ...emptyEditForm,
  });

  function openCreate() {
    setCreateForm({ ...emptyCreateForm });
    setCreating(true);
  }

  function closeCreate() {
    setCreating(false);
    setCreateForm({ ...emptyCreateForm });
  }

  function closeEdit() {
    setEditing(null);
    setForm({ ...emptyEditForm });
  }

  async function createUser(event: React.FormEvent) {
    event.preventDefault();

    setCreatingSaving(true);

    try {
      const body: Record<string, unknown> = {
        fullName: createForm.fullName,
        username: createForm.username,
        email: createForm.email,
        role: createForm.role,
        password: createForm.password,
        isActive: createForm.isActive,
        balancePaisa:
          createForm.balance === ""
            ? 0
            : Math.round(Number(createForm.balance) * 100),
      };

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((current) => [data.user, ...current]);
      closeCreate();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to create user."
      );
    } finally {
      setCreatingSaving(false);
    }
  }

  function editUser(user: User) {
    setEditing(user);

    setForm({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      balance: String(user.balancePaisa / 100),
      password: "",
      isActive: user.isActive,
    });
  }

  async function saveUser(event: React.FormEvent) {
    event.preventDefault();

    if (!editing) return;

    setSaving(true);

    try {
      const body: Record<string, unknown> = {
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        role: form.role,
        balancePaisa: Math.round(Number(form.balance) * 100),
        isActive: form.isActive,
      };

      if (form.password) {
        body.password = form.password;
      }

      const response = await fetch(
        `/api/admin/users/${editing.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === editing.id
            ? {
                ...user,
                ...data.user,
                balancePaisa: body.balancePaisa as number,
              }
            : user
        )
      );

      closeEdit();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update user."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleUser(user: User) {
    if (togglingId === user.id) return;

    setTogglingId(user.id);

    try {
      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !user.isActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, isActive: data.user.isActive }
            : item
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update user."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteUser(user: User) {
    if (deletingId === user.id) return;

    if (!confirm(`Delete ${user.fullName}?`)) {
      return;
    }

    setDeletingId(user.id);

    try {
      const response = await fetch(
        `/api/admin/users/${user.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUsers((current) =>
        current.filter((item) => item.id !== user.id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = users.filter((user) => {
    const query = search.toLowerCase();

    return (
      user.fullName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* CREATE MODAL */}
      {creating && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeCreate}
        >
          <form
            onSubmit={createUser}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl rounded-3xl border border-[#dceedd] bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-[#173b20]">
                  Create User
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add a new Grow Vest account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreate}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-[#eff8f0] hover:text-[#2f7d32]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                value={createForm.fullName}
                onChange={(value) =>
                  setCreateForm({
                    ...createForm,
                    fullName: value,
                  })
                }
              />

              <Field
                label="Username"
                value={createForm.username}
                onChange={(value) =>
                  setCreateForm({
                    ...createForm,
                    username: value,
                  })
                }
              />

              <Field
                label="Email"
                type="email"
                value={createForm.email}
                onChange={(value) =>
                  setCreateForm({
                    ...createForm,
                    email: value,
                  })
                }
              />

              <Field
                label="Password"
                type="password"
                value={createForm.password}
                onChange={(value) =>
                  setCreateForm({
                    ...createForm,
                    password: value,
                  })
                }
              />

              <Field
                label="Opening Balance (PKR)"
                type="number"
                value={createForm.balance}
                required={false}
                onChange={(value) =>
                  setCreateForm({
                    ...createForm,
                    balance: value,
                  })
                }
              />

              <label>
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  Role
                </span>

                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      role: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#173b20]">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    isActive: event.target.checked,
                  })
                }
                className="accent-[#45a94a]"
              />
              Account Active
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={creatingSaving}
                className="flex items-center gap-2 rounded-xl bg-[#45a94a] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f7d32] disabled:opacity-60"
              >
                {creatingSaving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {creatingSaving
                  ? "Creating..."
                  : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editing && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeEdit}
        >
          <form
            onSubmit={saveUser}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-2xl rounded-3xl border border-[#dceedd] bg-white p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-[#173b20]">
                  Edit User
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update {editing.fullName}&apos;s account details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-[#eff8f0] hover:text-[#2f7d32]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                value={form.fullName}
                onChange={(value) =>
                  setForm({
                    ...form,
                    fullName: value,
                  })
                }
              />

              <Field
                label="Username"
                value={form.username}
                onChange={(value) =>
                  setForm({
                    ...form,
                    username: value,
                  })
                }
              />

              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  setForm({
                    ...form,
                    email: value,
                  })
                }
              />

              <Field
                label="Balance (PKR)"
                type="number"
                value={form.balance}
                onChange={(value) =>
                  setForm({
                    ...form,
                    balance: value,
                  })
                }
              />

              <Field
                label="New Password"
                type="password"
                value={form.password}
                required={false}
                onChange={(value) =>
                  setForm({
                    ...form,
                    password: value,
                  })
                }
              />

              <label>
                <span className="mb-2 block text-xs font-bold text-gray-600">
                  Role
                </span>

                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
            </div>

            <label className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#173b20]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm({
                    ...form,
                    isActive: event.target.checked,
                  })
                }
                className="accent-[#45a94a]"
              />
              Account Active
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#45a94a] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f7d32] disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOOLBAR */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users..."
          className="h-12 w-full max-w-md rounded-xl border border-[#dceedd] bg-white px-4 text-sm text-[#173b20] outline-none transition placeholder:text-gray-400 focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
        />

        <button
          type="button"
          onClick={openCreate}
          className="flex h-12 items-center gap-2 rounded-xl bg-[#45a94a] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2f7d32]"
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-[#dceedd] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-[#f4faf4] text-xs uppercase text-[#2f7d32]">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Balance</th>
                <th className="px-5 py-4">Investment</th>
                <th className="px-5 py-4">Profit</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((user) => {
                const isToggling =
                  togglingId === user.id;

                const isDeleting =
                  deletingId === user.id;

                const rowBusy =
                  isToggling || isDeleting;

                return (
                  <tr
                    key={user.id}
                    className={`border-t border-[#edf4ed] transition hover:bg-[#f9fcf9] ${
                      rowBusy ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#173b20]">
                        {user.fullName}
                      </p>

                      <p className="text-xs text-gray-500">
                        @{user.username}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-[#173b20]">
                      {money(user.balancePaisa)}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {money(user.totalInvestmentPaisa)}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-green-600">
                      {money(user.totalProfitPaisa)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.isActive
                          ? "Active"
                          : "Disabled"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editUser(user)}
                          disabled={rowBusy}
                          title="Edit user"
                          aria-label="Edit user"
                          className="rounded-lg border border-[#dceedd] bg-[#eff8f0] p-2 text-[#2f7d32] transition hover:bg-[#e4f4e5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleUser(user)}
                          disabled={rowBusy}
                          title={
                            user.isActive
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          aria-label={
                            user.isActive
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          className="rounded-lg border border-[#dceedd] bg-[#f4faf4] p-2 text-[#45a94a] transition hover:bg-[#e4f4e5] disabled:cursor-not-allowed disabled:opacity-50"
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
                          onClick={() => deleteUser(user)}
                          disabled={rowBusy}
                          title="Delete user"
                          aria-label="Delete user"
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

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-sm text-gray-500"
                  >
                    No users found.
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  const isRequired =
    required ?? label !== "New Password";

  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-gray-600">
        {label}
      </span>

      <input
        required={isRequired}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-[#45a94a] focus:ring-2 focus:ring-[#45a94a]/10"
      />
    </label>
  );
}