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
  Gift,
  BadgeCheck,
  RotateCcw,
  History,
  ShieldCheck,
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
    {
      icon: <Home size={19} strokeWidth={2.3} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <Coins size={19} strokeWidth={2.3} />,
      label: "Invest Plan",
      href: "/dashboard/invest-plan",
    },
    {
      icon: <BarChart3 size={19} strokeWidth={2.3} />,
      label: "My Running Plans",
      href: "/dashboard/running-plans",
    },
    {
      icon: <Wallet size={19} strokeWidth={2.3} />,
      label: "Deposit",
      href: "/dashboard/deposit",
    },
    {
      icon: <ArrowUpFromLine size={19} strokeWidth={2.3} />,
      label: "Withdraw",
      href: "/dashboard/withdraw",
    },
    {
      icon: <FileText size={19} strokeWidth={2.3} />,
      label: "Transactions",
      href: "/dashboard/transactions",
    },
    {
      icon: <Users size={19} strokeWidth={2.3} />,
      label: "My Team",
      href: "/dashboard/team",
    },
    {
      icon: <RotateCcw size={19} strokeWidth={2.3} />,
      label: "Salary Rewards",
      href: "/dashboard/salary-rewards",
    },
    {
      icon: <BadgeCheck size={19} strokeWidth={2.3} />,
      label: "Rankings",
      href: "/dashboard/rankings",
    },
    {
      icon: <History size={19} strokeWidth={2.3} />,
      label: "Deposit History",
      href: "/dashboard/deposit-history",
    },
    {
      icon: <FileText size={19} strokeWidth={2.3} />,
      label: "Withdrawal History",
      href: "/dashboard/withdrawal-history",
    },
    {
      icon: <Gift size={19} strokeWidth={2.3} />,
      label: "Referral Bonus",
      href: "/dashboard/referral-bonus",
    },
    {
      icon: <ShieldCheck size={19} strokeWidth={2.3} />,
      label: "Verification",
      href: "/dashboard/verification",
    },
  ];

  return (
    <>
      {/* ==========================================================
          MOBILE BACKDROP
      ========================================================== */}
      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-[90]
          bg-black/45
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          lg:hidden
          ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ==========================================================
          SIDEBAR
      ========================================================== */}
      <aside
        className={`
          fixed
          left-0
          top-[72px]
          z-[100]
          flex
          h-[calc(100dvh-72px)]
          w-[245px]
          flex-col
          overflow-hidden
          border-r
          border-white/10
          shadow-[4px_0_25px_rgba(20,15,80,0.25)]
          transition-transform
          duration-300
          ease-in-out
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
        style={{
          background:
            "linear-gradient(145deg, #281477 0%, #241675 38%, #102d79 100%)",
        }}
      >
        {/* ========================================================
            DIAGONAL GLASS PATTERN
        ======================================================== */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.12]
          "
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 18px, rgba(255,255,255,0.35) 19px, transparent 20px, transparent 38px)",
          }}
        />

        {/* ========================================================
            SOFT LIGHT GLOW
        ======================================================== */}
        <div
          className="
            pointer-events-none
            absolute
            -left-20
            top-10
            h-52
            w-52
            rounded-full
            bg-purple-400/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            bottom-20
            h-64
            w-64
            rounded-full
            bg-blue-400/10
            blur-3xl
          "
        />

        {/* ========================================================
            CONTENT
        ======================================================== */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          

         

          {/* ======================================================
              NAVIGATION
          ====================================================== */}
          <nav className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <p
              className="
                mb-2
                px-2
                text-[8px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-white/45
              "
            >
              Main Menu
            </p>

            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(
                      `${item.href}/`
                    ));

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      router.push(item.href);

                      if (
                        window.innerWidth < 1024
                      ) {
                        onClose();
                      }
                    }}
                    className={`
                      group
                      flex
                      h-[46px]
                      w-full
                      items-center
                      gap-3
                      rounded-[14px]
                      border
                      px-3
                      text-left
                      backdrop-blur-md
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? `
                            border-white/25
                            bg-white/[0.19]
                            text-white
                            shadow-[0_5px_18px_rgba(0,0,0,0.12)]
                          `
                          : `
                            border-white/[0.08]
                            bg-white/[0.055]
                            text-white/85
                            shadow-sm
                            hover:border-white/15
                            hover:bg-white/[0.12]
                            hover:text-white
                          `
                      }
                    `}
                  >
                    {/* Icon */}
                    <span
                      className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-[10px]
                        border
                        backdrop-blur-sm
                        transition
                        ${
                          isActive
                            ? `
                              border-white/20
                              bg-white/[0.17]
                              text-white
                            `
                            : `
                              border-white/10
                              bg-white/[0.08]
                              text-white/80
                              group-hover:bg-white/[0.14]
                            `
                        }
                      `}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className="truncate text-[11px] font-semibold">
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className="
                          ml-auto
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-white
                          shadow-[0_0_7px_rgba(255,255,255,0.9)]
                        "
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ======================================================
              LOGOUT
          ====================================================== */}
          <div
            className="
              shrink-0
              border-t
              border-white/10
              bg-black/5
              p-3
            "
          >
            <button
              type="button"
              onClick={handleLogout}
              className="
                group
                flex
                h-[46px]
                w-full
                items-center
                gap-3
                rounded-[14px]
                border
                border-red-300/20
                bg-red-400/[0.08]
                px-3
                text-left
                text-white/90
                backdrop-blur-md
                transition
                hover:border-red-300/30
                hover:bg-red-400/[0.16]
                hover:text-white
              "
            >
              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-[10px]
                  border
                  border-white/10
                  bg-white/[0.08]
                  text-white
                  backdrop-blur-sm
                "
              >
                <LogOut
                  size={18}
                  strokeWidth={2.3}
                />
              </span>

              <span className="text-[11px] font-semibold">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}