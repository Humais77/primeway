"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  WalletCards,
  TrendingUp,
  LogOut,
  ArrowDownToLine,
  ArrowUpFromLine,
  ReceiptText,
  Settings,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Investment Plans",
    href: "/admin/investment-plans",
    icon: WalletCards,
  },
  {
    label: "Investments",
    href: "/admin/investments",
    icon: TrendingUp,
  },
  {
    label: "Deposits",
    href: "/admin/deposits",
    icon: ArrowDownToLine,
  },
  {
    label: "Withdrawals",
    href: "/admin/withdrawals",
    icon: ArrowUpFromLine,
  },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: ReceiptText,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    window.location.href = "/login";
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] bg-[#111b58] text-white lg:flex lg:flex-col">
      <div className="flex h-[72px] items-center border-b border-white/10 px-6">
        <div>
          <p className="text-xl font-black">
            PRIME WAY
          </p>

          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Administration
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (
              item.href !== "/admin" &&
              pathname.startsWith(
                item.href + "/"
              )
            );

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-white text-[#4020bd]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/70 transition hover:bg-red-500/20 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}