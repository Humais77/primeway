"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Wallet,
  ArrowUpFromLine,
  Users,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Invest",
    href: "/dashboard/invest-plan",
    icon: BarChart3,
  },
  {
    label: "Deposit",
    href: "/dashboard/deposit",
    icon: Wallet,
  },
  {
    label: "Withdraw",
    href: "/dashboard/withdraw",
    icon: ArrowUpFromLine,
  },
  {
    label: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed
        bottom-3
        left-1/2
        z-[200]
        flex
        h-[64px]
        w-[calc(100%-16px)]
        max-w-[720px]
        -translate-x-1/2
        items-center
        rounded-[18px]
        border
        border-white/20
        bg-gradient-to-r
        from-[#281477]
        via-[#4020bd]
        to-[#063d82]
        p-1
        shadow-[0_8px_30px_rgba(30,20,100,0.30)]
        backdrop-blur-xl
        lg:hidden
      "
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;

        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

        return (
          <div
            key={item.href}
            className="flex h-full flex-1 items-center"
          >
            <Link
              href={item.href}
              className={`
                flex
                h-full
                w-full
                items-center
                justify-center
                rounded-[14px]
                transition-all
                duration-200
                ${
                  isActive
                    ? `
                      border
                      border-white/40
                      bg-white/[0.18]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]
                      backdrop-blur-md
                    `
                    : `
                      border
                      border-transparent
                      hover:bg-white/[0.10]
                    `
                }
              `}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.6 : 2.2}
                  className="text-white"
                />

                <span
                  className={`
                    text-[9px]
                    font-semibold
                    leading-none
                    ${
                      isActive
                        ? "text-white"
                        : "text-white/85"
                    }
                  `}
                >
                  {item.label}
                </span>
              </div>
            </Link>

            {/* Separator */}
            {index < navItems.length - 1 && (
              <div className="h-7 w-px shrink-0 bg-white/25" />
            )}
          </div>
        );
      })}
    </nav>
  );
}