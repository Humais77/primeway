"use client";

import { Bell, Menu } from "lucide-react";
import { useDashboardUI } from "./DashboardUI";

export default function DashboardHeader() {
  const { openSidebar } = useDashboardUI();

  return (
    <header className="mb-4 flex items-center justify-between">
      <button
        onClick={openSidebar}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-gray-50"
      >
        <Menu
          size={21}
          className="text-[#111b58]"
        />
      </button>

      <div className="text-center">
        <h1 className="text-xl font-bold text-[#111b58]">
          Prime Way
        </h1>

        <p className="text-[7px] tracking-[0.25em] text-gray-500">
          INVEST TODAY, EARN TOMORROW
        </p>
      </div>

      <button
        aria-label="Notifications"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm"
      >
        <Bell
          size={19}
          className="text-[#111b58]"
        />
      </button>
    </header>
  );
}