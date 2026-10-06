"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  WalletCards,
  TrendingUp,
  LogOut,
  ArrowUpFromLine,
  ReceiptText,
  Wallet,
  CreditCard,
  Gift,
  Menu,
  X,
} from "lucide-react";

const items = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Investment Plans", href: "/admin/investment-plans", icon: WalletCards },
  { label: "Investments", href: "/admin/investments", icon: TrendingUp },
  { label: "Deposits", href: "/admin/deposits", icon: Wallet },
  { label: "Payment Accounts", href: "/admin/payment-accounts", icon: CreditCard },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpFromLine },
  { label: "Transactions", href: "/admin/transactions", icon: ReceiptText },
  { label: "Referral Settings", href: "/admin/referral-settings", icon: Gift },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open on mobile
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const isActive = (href: string) =>
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(href + "/"));

  const navContent = (
    <>
      {/* Brand */}
      <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-6">
        <div>
          <p className="text-xl font-black tracking-tight">Grow Vest</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            Administration
          </p>
        </div>

        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#2f7d32] shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/75 transition hover:bg-red-500/20 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* =========================================================
          DESKTOP SIDEBAR  (unchanged behaviour)
      ========================================================= */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] bg-gradient-to-b from-[#1f7a3a] via-[#2f7d32] to-[#173b20] text-white shadow-xl shadow-green-950/10 lg:flex lg:flex-col">
        {navContent}
      </aside>

      {/* =========================================================
          MOBILE HAMBURGER BUTTON
      ========================================================= */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f7a3a] text-white shadow-lg shadow-green-950/20 transition hover:bg-[#2f7d32] lg:hidden"
      >
        <Menu size={22} strokeWidth={2.5} />
      </button>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================= */}
      {open && (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <aside
            className="absolute left-0 top-0 flex h-full w-[270px] max-w-[85vw] flex-col bg-gradient-to-b from-[#1f7a3a] via-[#2f7d32] to-[#173b20] text-white shadow-2xl"
            style={{
              animation: "slideIn 0.2s ease-out",
            }}
          >
            {navContent}
          </aside>

          <style jsx>{`
            @keyframes slideIn {
              from {
                transform: translateX(-100%);
              }
              to {
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}