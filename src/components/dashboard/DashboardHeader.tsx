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
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const firstName = fullName.split(" ")[0];

  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-[110]
        flex
        h-[72px]
        w-full
        items-center
        justify-between
        border-b
        border-[#e6e9f5]
        bg-white
        px-4
        shadow-[0_2px_15px_rgba(30,45,100,0.08)]
        md:px-6
        lg:px-8
      "
    >
      {/* =========================================================
          LEFT SECTION
      ========================================================= */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Hamburger */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-[#4020bd]
            transition
            hover:bg-[#eef0ff]
            hover:text-[#063d82]
          "
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-[#4020bd]
              to-[#063d82]
              text-white
              shadow-[0_5px_16px_rgba(64,32,189,0.25)]
            "
          >
            <TrendingUp
              size={24}
              strokeWidth={2.5}
            />
          </div>

          <div className="hidden sm:block">
            <h1
              className="
                text-xl
                font-black
                leading-none
                tracking-wide
                text-[#063d82]
                md:text-2xl
              "
            >
              Prime{" "}
              <span className="text-[#4020bd]">
                Way
              </span>
            </h1>

            <p
              className="
                mt-1
                text-[8px]
                font-bold
                tracking-[0.2em]
                text-gray-400
                md:text-[9px]
              "
            >
              INVEST TODAY, EARN TOMORROW
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT SECTION
      ========================================================= */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Settings */}
        <button
          type="button"
          aria-label="Settings"
          className="
            hidden
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-[#eef0ff]
            text-[#4020bd]
            transition
            hover:bg-[#e1e4ff]
            md:flex
          "
        >
          <Settings
            size={18}
            strokeWidth={2.4}
          />
        </button>

        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="
            hidden
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-[#eef0ff]
            text-[#4020bd]
            transition
            hover:bg-[#e1e4ff]
            sm:flex
          "
        >
          <Bell
            size={18}
            strokeWidth={2.4}
          />
        </button>

        {/* Profile */}
        <div
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-[#e4e7f5]
            bg-white
            px-2
            py-1.5
            shadow-sm
            md:gap-3
            md:px-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-[#4020bd]
              to-[#063d82]
              text-[11px]
              font-bold
              text-white
            "
          >
            {fullName
              .substring(0, 2)
              .toUpperCase()}
          </div>

          <div className="hidden flex-col sm:flex">
            <span className="text-[9px] text-gray-400">
              Welcome!
            </span>

            <span className="mt-0.5 text-xs font-bold text-[#111b58]">
              {firstName}
            </span>
          </div>

          <ChevronDown
            size={15}
            className="text-[#4020bd]"
            strokeWidth={2.5}
          />
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-gray-200 lg:block" />

        {/* Balance */}
        <div className="hidden items-center gap-2 sm:flex md:gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#eef0ff]
              text-[#4020bd]
            "
          >
            <Wallet size={19} />
          </div>

          <div className="hidden flex-col md:flex">
            <span className="text-[9px] text-gray-400">
              Balance
            </span>

            <span className="text-sm font-bold text-[#4020bd]">
              {balanceStr}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-gray-200 lg:block" />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="
            flex
            h-10
            items-center
            gap-2
            rounded-xl
            px-2
            font-bold
            text-[#4020bd]
            transition
            hover:bg-[#eef0ff]
            hover:text-[#063d82]
            md:px-3
          "
        >
          <Power
            size={20}
            strokeWidth={2.5}
          />

          <span className="hidden text-xs lg:block">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}