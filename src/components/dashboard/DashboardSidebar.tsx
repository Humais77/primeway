"use client";

import {
  Home,
  Coins,
  BarChart3,
  Wallet,
  ArrowUpFromLine,
  FileText,
  Users,
  LogOut,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type DashboardSidebarProps = {
  open: boolean;
  onClose: () => void;
  fullName: string;
  userId: string;
};

export default function DashboardSidebar({
  open,
  onClose,
  fullName,
  userId,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    { icon: <Home size={22} strokeWidth={2.3} />, label: "Dashboard", href: "/dashboard" },
    { icon: <Coins size={22} strokeWidth={2.3} />, label: "Invest Plan", href: "/dashboard/invest-plan" },
    { icon: <BarChart3 size={22} strokeWidth={2.3} />, label: "My Running Plans", href: "/dashboard/running-plans" },
    { icon: <Wallet size={22} strokeWidth={2.3} />, label: "Deposit", href: "/dashboard/deposit" },
    { icon: <ArrowUpFromLine size={22} strokeWidth={2.3} />, label: "Withdraw", href: "/dashboard/withdraw" },
    { icon: <FileText size={22} strokeWidth={2.3} />, label: "Transactions", href: "/dashboard/transactions" },
    { icon: <Users size={22} strokeWidth={2.3} />, label: "My Team", href: "/dashboard/team" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-[100] h-dvh w-[280px] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(145deg, #281477 0%, #241675 38%, #102d79 100%)",
        }}
      >
        {/* Diagonal pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 18px, rgba(255,255,255,0.35) 19px, transparent 20px, transparent 38px)",
          }}
        />

        {/* Content */}
        <div className="relative min-h-full px-5 pb-10 pt-6 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black/20 shadow-lg">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-yellow-400/50 bg-[#10194f]">
                  <div className="text-center">
                    <div className="text-[17px] font-black leading-none text-white">
                      PW
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div>
                <h1 className="text-[20px] font-extrabold leading-none text-white">
                  Prime Way
                </h1>
                <p className="mt-1 text-[8.5px] font-semibold tracking-[0.15em] text-white/75">
                  INVEST TODAY, EARN TOMORROW
                </p>
              </div>
            </div>

            {/* Mobile Close */}
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 lg:hidden"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* User Card - Glass Effect */}
          <div className="mt-8 rounded-2xl border border-white/20 bg-white/[0.07] px-4 py-4 shadow-inner backdrop-blur-sm">
            <h2 className="text-[19px] font-bold leading-none text-white">
              {fullName}
            </h2>
            <p className="mt-1.5 text-[13px] font-medium text-white/70">
              User ID: {userId} • Active
            </p>
          </div>

          {/* Navigation - Glass Options */}
          <div className="mt-6 space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    router.push(item.href);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`flex h-[64px] w-full items-center gap-4 rounded-[20px] border px-4 text-left shadow-sm backdrop-blur-sm transition-all hover:bg-white/[0.15] ${
                    isActive
                      ? "border-white/30 bg-white/[0.18]"
                      : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  <span
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] backdrop-blur-sm ${
                      isActive
                        ? "bg-white/20 text-white shadow-inner"
                        : "bg-white/10 text-white/90"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[16px] font-semibold text-white">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Logout Option */}
            <button
              onClick={handleLogout}
              className="mt-6 flex h-[64px] w-full items-center gap-4 rounded-[20px] border border-red-400/30 bg-gradient-to-r from-red-500/20 to-red-500/10 px-4 text-left shadow-sm transition hover:bg-red-500/25"
            >
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-white/10 text-white backdrop-blur-sm">
                <LogOut size={22} strokeWidth={2.3} />
              </span>
              <span className="text-[16px] font-semibold text-white">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}