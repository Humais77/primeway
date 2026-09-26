"use client";

import {
  Bell,
  Menu,
  Settings,
  Wallet,
  Power,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import { useDashboardUI } from "./DashboardUI";
import { useRouter } from "next/navigation";

type DashboardHeaderProps = {
  fullName?: string;
  balanceStr?: string;
};

export default function DashboardHeader({
  fullName = "Humais Ur Rehman",
  balanceStr = "Rs 0.00",
}: DashboardHeaderProps) {
  const { toggleSidebar } = useDashboardUI();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="mb-6 flex w-full items-center justify-between rounded-xl bg-white/50 px-4 py-3 shadow-sm backdrop-blur-sm md:px-8 lg:rounded-full">
      {/* Left Section - Logo & Menu */}
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center text-[#4020bd] transition hover:text-[#063d82]"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#4020bd] to-[#063d82] text-white shadow-md">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div className="hidden flex-col sm:flex">
            <h1 className="text-xl font-black uppercase tracking-wide text-[#063d82] md:text-2xl">
              Prime <span className="text-[#4020bd]">Way</span>
            </h1>
            <p className="text-[8px] font-bold tracking-[0.2em] text-gray-500 md:text-[9px]">
              INVEST TODAY, EARN TOMORROW
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Controls & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Quick Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#4020bd] transition hover:bg-blue-100 hover:text-[#063d82]">
            <Settings size={19} strokeWidth={2.5} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#4020bd] transition hover:bg-blue-100 hover:text-[#063d82]">
            <Bell size={19} strokeWidth={2.5} />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-full bg-gray-50 px-3 py-1.5 pr-4 shadow-inner">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#4020bd] to-[#063d82] text-sm font-bold text-white shadow-sm">
            {fullName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] font-medium text-gray-500">Welcome!</span>
            <span className="text-sm font-bold text-[#111b58]">
              {fullName.split(" ")[0]}
            </span>
          </div>
          <ChevronDown size={16} className="ml-1 text-[#4020bd]" />
        </div>

        <div className="hidden h-8 w-px bg-gray-200 lg:block"></div>

        {/* Balance Display */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#4020bd] to-[#063d82] text-white shadow-md">
            <Wallet size={20} />
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-[10px] font-medium text-gray-500">Balance</span>
            <span className="text-sm font-bold text-[#4020bd]">{balanceStr}</span>
          </div>
        </div>

        <div className="hidden h-8 w-px bg-gray-200 lg:block"></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 font-bold text-[#4020bd] transition hover:text-[#063d82]"
        >
          <Power size={20} strokeWidth={2.5} />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </header>
  );
}