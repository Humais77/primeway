"use client";

import Image from "next/image";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  LogOut,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[100] h-dvh w-[82%] max-w-[465px] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(145deg, #281477 0%, #241675 38%, #102d79 100%)",
        }}
      >
        {/* Diagonal pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 18px, rgba(255,255,255,0.35) 19px, transparent 20px, transparent 38px)",
          }}
        />

        {/* Content */}
        <div className="relative min-h-full px-6 pb-10 pt-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black/20 shadow-lg">
                <div className="flex h-[56px] w-[56px] items-center justify-center rounded-xl border border-yellow-400/50 bg-[#10194f]">
                  <div className="text-center">
                    <div className="text-[22px] font-black leading-none text-white">
                      PW
                    </div>

                    <div className="mt-1 text-[5px] font-semibold tracking-[0.12em] text-yellow-300">
                      PRIME WAY
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand */}
              <div>
                <h1 className="text-[25px] font-extrabold leading-none text-white">
                  Prime Way
                </h1>

                <p className="mt-2 text-[10px] font-semibold tracking-[0.18em] text-white/75">
                  INVEST TODAY, EARN TOMORROW
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="flex h-[58px] w-[58px] items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <X size={32} strokeWidth={2.5} />
            </button>
          </div>

          {/* User Card */}
          <div className="mt-9 rounded-[25px] border border-white/20 bg-white/[0.07] px-5 py-5 shadow-inner backdrop-blur-sm">
            <h2 className="text-[23px] font-bold leading-none text-white">
              {fullName}
            </h2>

            <p className="mt-2 text-[15px] font-medium text-white/70">
              User ID: {userId} • Account Active
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-6 space-y-4">
            <SidebarItem
              icon={<ArrowDownToLine />}
              label="Deposit"
              onClick={() => {
                onClose();
                router.push("/dashboard/deposit");
              }}
            />

            <SidebarItem
              icon={<ArrowUpFromLine />}
              label="Withdraw"
              onClick={() => {
                onClose();
                router.push("/dashboard/withdraw");
              }}
            />

            <SidebarItem
              icon={<ArrowLeftRight />}
              label="Transaction"
              onClick={() => {
                onClose();
                router.push("/dashboard/transactions");
              }}
            />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex h-[82px] w-full items-center gap-5 rounded-[24px] border border-red-400/30 bg-gradient-to-r from-red-500/20 to-red-500/10 px-5 text-left shadow-sm transition hover:bg-red-500/25"
            >
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[15px] bg-white/10 text-white backdrop-blur-sm">
                <LogOut size={29} strokeWidth={2.3} />
              </span>

              <span className="text-[21px] font-semibold text-white">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-[82px] w-full items-center gap-5 rounded-[24px] border border-white/15 bg-white/[0.06] px-5 text-left shadow-sm backdrop-blur-sm transition hover:bg-white/[0.11]"
    >
      <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[15px] bg-white/10 text-white backdrop-blur-sm">
        {icon}
      </span>

      <span className="text-[21px] font-semibold text-white">
        {label}
      </span>
    </button>
  );
}