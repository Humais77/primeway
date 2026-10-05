"use client";

import { useEffect } from "react";
import {
  Home,
  Coins,
  BarChart3,
  Wallet,
  ArrowUpFromLine,
  FileText,
  Users,
  LogOut,
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

  // -----------------------------------------------------------
  // Lock body scroll while the sidebar is open on mobile.
  // -----------------------------------------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia(
      "(max-width: 1023px)"
    ).matches;

    if (!open || !isMobile) {
      return;
    }

    const scrollY = window.scrollY;

    const body = document.body;
    const html = document.documentElement;

    const prevBodyPosition =
      body.style.position;

    const prevBodyTop = body.style.top;

    const prevBodyWidth =
      body.style.width;

    const prevBodyOverflow =
      body.style.overflow;

    const prevHtmlOverflow =
      html.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position =
        prevBodyPosition;

      body.style.top = prevBodyTop;

      body.style.width =
        prevBodyWidth;

      body.style.overflow =
        prevBodyOverflow;

      html.style.overflow =
        prevHtmlOverflow;

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const navItems = [
    {
      icon: (
        <Home
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: (
        <Coins
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Invest Plan",
      href: "/dashboard/invest-plan",
    },
    {
      icon: (
        <BarChart3
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "My Running Plans",
      href: "/dashboard/running-plans",
    },
    {
      icon: (
        <Wallet
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Deposit",
      href: "/dashboard/deposit",
    },
    {
      icon: (
        <ArrowUpFromLine
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Withdraw",
      href: "/dashboard/withdraw",
    },
    {
      icon: (
        <FileText
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Transactions",
      href: "/dashboard/transactions",
    },
    {
      icon: (
        <Users
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "My Team",
      href: "/dashboard/my-team",
    },
    {
      icon: (
        <History
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Deposit History",
      href: "/dashboard/deposit-history",
    },
    {
      icon: (
        <FileText
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Withdrawal History",
      href: "/dashboard/withdrawal-history",
    },
    {
      icon: (
        <Gift
          size={21}
          strokeWidth={2.2}
        />
      ),
      label: "Referral Bonus",
      href: "/dashboard/referral-bonus",
    },
  ];

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          z-[90]
          bg-[#0F3D2E]/55
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

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
          shadow-[4px_0_25px_rgba(15,61,46,0.25)]
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
            "linear-gradient(145deg, #0F3D2E 0%, #18613F 48%, #18B152 100%)",
        }}
      >
        {/* =====================================================
            DIAGONAL GLASS PATTERN
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.10]
          "
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, transparent 0px, transparent 18px, rgba(255,255,255,0.30) 19px, transparent 20px, transparent 38px)",
          }}
        />

        {/* =====================================================
            SOFT LIGHT GLOW
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -left-20
            top-10
            h-52
            w-52
            rounded-full
            bg-[#18B152]/20
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
            bg-[#18B152]/15
            blur-3xl
          "
        />

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* ===================================================
              NAVIGATION
          =================================================== */}

          <nav
            className="
              scrollbar-thin
              min-h-0
              flex-1
              overflow-y-auto
              px-3
              py-4
            "
          >
            <p
              className="
                mb-2
                px-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-white/50
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
                        window.innerWidth <
                        1024
                      ) {
                        onClose();
                      }
                    }}
                    className={`
                      group
                      flex
                      h-[50px]
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
                            border-white/30
                            bg-[#18B152]
                            text-white
                            shadow-[0_5px_18px_rgba(0,0,0,0.16)]
                          `
                          : `
                            border-white/[0.08]
                            bg-white/[0.055]
                            text-white/90
                            shadow-sm
                            hover:border-white/20
                            hover:bg-white/[0.13]
                            hover:text-white
                          `
                      }
                    `}
                  >
                    {/* Icon */}

                    <span
                      className={`
                        flex
                        h-9
                        w-9
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
                              border-white/25
                              bg-white/[0.18]
                              text-white
                            `
                            : `
                              border-white/10
                              bg-white/[0.08]
                              text-white/85
                              group-hover:bg-white/[0.14]
                            `
                        }
                      `}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}

                    <span className="truncate text-[13px] font-semibold">
                      {item.label}
                    </span>

                    {/* Active Indicator */}

                    {isActive && (
                      <span
                        className="
                          ml-auto
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-white
                          shadow-[0_0_8px_rgba(255,255,255,0.9)]
                        "
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ===================================================
              LOGOUT
          =================================================== */}

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
                h-[50px]
                w-full
                items-center
                gap-3
                rounded-[14px]
                border
                border-white/10
                bg-white/[0.06]
                px-3
                text-left
                text-white/90
                backdrop-blur-md
                transition
                hover:border-white/20
                hover:bg-white/[0.12]
                hover:text-white
              "
            >
              <span
                className="
                  flex
                  h-9
                  w-9
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
                  size={20}
                  strokeWidth={2.2}
                />
              </span>

              <span className="text-[13px] font-semibold">
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}