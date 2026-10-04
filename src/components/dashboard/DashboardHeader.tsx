"use client";

import {
  Bell,
  Menu,
  Settings,
  Wallet,
  Power,
  ChevronDown,
  CheckCircle2,
  Info,
  AlertCircle,
  X,
  Trash2,
} from "lucide-react";

import { useDashboardUI } from "./DashboardUI";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { images } from "@/src/lib/images";
type DashboardHeaderProps = {
  fullName?: string;
  balanceStr?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type ProfileData = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  balancePaisa: number;
  referralCode?: string;
  referralLevel?: number;
};

export default function DashboardHeader({
  fullName = "Humais Ur Rehman",
  balanceStr = "Rs 0.00",
}: DashboardHeaderProps) {
  const { toggleSidebar } = useDashboardUI();
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * LOAD NOTIFICATIONS
   * =========================================================
   */

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };

const handleMarkAllRead = async () => {
  if (unreadCount === 0) {
    return;
  }

  try {
    const response = await fetch(
      "/api/notifications",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to mark notifications as read."
      );
    }

    // Update the UI immediately.
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadCount(0);
  } catch (error) {
    console.error(
      "Failed to mark all notifications:",
      error
    );
  }
};


  /*
   * =========================================================
   * LOAD PROFILE
   * =========================================================
   */

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        cache: "no-store",
      });

      if (!response.ok) return;

      const data = await response.json();

      setProfile(data.user ?? null);
    } catch (error) {
      console.error(
        "Failed to load profile:",
        error
      );
    }
  };

  /*
   * =========================================================
   * INITIAL LOAD + REFRESH
   * =========================================================
   */

  useEffect(() => {
    loadNotifications();
    loadProfile();

    const interval = setInterval(() => {
      loadNotifications();
      loadProfile();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * =========================================================
   * CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
   * =========================================================
   */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

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
      router.push("/login");
      router.refresh();
    }
  };

  /*
   * =========================================================
   * MARK NOTIFICATION READ
   * =========================================================
   */

  const handleDeleteNotification = async (
    notification: NotificationItem
  ) => {
    try {
      const response = await fetch(
        `/api/notifications/${notification.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete notification."
        );
      }

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== notification.id
        )
      );

      if (!notification.isRead) {
        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete notification:",
        error
      );
    }
  };



  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const firstName =
    profile?.fullName?.split(" ")[0] ||
    fullName.split(" ")[0];

  const displayName =
    profile?.fullName || fullName;

  const username =
    profile?.username || "";

  const email =
    profile?.email || "";

  /*
   * Referral level:
   *
   * Every user starts at Level 1.
   * After their first successful referred investment,
   * they become Level 2 permanently.
   */

  const referralLevel =
    profile?.referralLevel === 2
      ? 2
      : 1;

  const referralLevelLabel =
    referralLevel === 2
      ? "Level 2"
      : "Level 1";

  /*
   * Balance:
   *
   * balancePaisa is the source of truth.
   * 100 paisa = 1 PKR.
   */

  const liveBalancePaisa =
    profile?.balancePaisa ?? null;

  const liveBalance =
    liveBalancePaisa !== null
      ? `Rs ${(liveBalancePaisa / 100).toLocaleString(
        "en-PK",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`
      : balanceStr;

  const initials = displayName
    .substring(0, 2)
    .toUpperCase();

  const getNotificationIcon = (
    type: string
  ) => {
    if (type === "LOGIN") {
      return (
        <CheckCircle2
          size={18}
          className="text-[#18B152]"
        />
      );
    }

    if (type === "WARNING") {
      return (
        <AlertCircle
          size={18}
          className="text-amber-500"
        />
      );
    }

    return (
      <Info
        size={18}
        className="text-[#18B152]"
      />
    );
  };

  const formatNotificationTime = (
    date: string
  ) => {
    const notificationDate = new Date(date);
    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString(
      "en-PK",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

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
        border-[#DCEDE3]
        bg-white
        px-4
        shadow-[0_2px_15px_rgba(24,97,63,0.08)]
        md:px-6
        lg:px-8
      "
    >
      {/* =========================================================
          LEFT SECTION
      ========================================================= */}

      <div className="flex items-center gap-4 md:gap-6">
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
            text-[#18B152]
            transition
            hover:bg-[#EAF8F0]
            hover:text-[#18613F]
          "
        >
          <Menu
            size={24}
            strokeWidth={2.5}
          />
        </button>

        <Link
          href="/dashboard"
          aria-label="GrowVest — Home"
          className="flex items-center"
        >
          <Image
            src={images.brandLogo}
            alt="GrowVest"
            width={80}
            height={80}
            priority
            className="
    h-11
    w-11
    shrink-0
    object-contain
    md:h-12
    md:w-12
  "
          />

          <div className="flex h-11 flex-col justify-center md:h-12">
            <Image
              src={images.brandName}
              alt="GrowVest"
              width={200}
              height={48}
              priority
              className="
    h-6
    w-auto
    object-contain
    object-left
    md:h-7
  "
            />

            <span
              className="
                mt-0.5
                mb-[-12px]
                hidden
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-[#18613F]
                sm:block
                md:text-[9px]
                md:tracking-[0.28em]
              "
            >
              Invest · Grow · Together
            </span>
          </div>
        </Link>
      </div>

      {/* =========================================================
          RIGHT SECTION
      ========================================================= */}

      <div className="flex items-center gap-2 md:gap-4">


        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(
                (current) => !current
              );

              setShowProfile(false);
            }}
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-[#EAF8F0]
              text-[#18B152]
              transition
              hover:bg-[#D9F3E4]
              hover:text-[#18613F]
            "
          >
            <Bell
              size={18}
              strokeWidth={2.4}
            />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  min-w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-[#18B152]
                  px-1
                  text-[9px]
                  font-bold
                  text-white
                  ring-2
                  ring-white
                "
              >
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="
                absolute
                right-0
                top-12
                z-[150]
                w-[360px]
                overflow-hidden
                rounded-2xl
                border
                border-[#DCEDE3]
                bg-white
                shadow-[0_15px_50px_rgba(15,61,46,0.15)]
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                  border-b
                  border-[#E8F2EC]
                  px-4
                  py-3.5
                "
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#0F3D2E]">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="
                        rounded-lg
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-bold
                        text-[#18B152]
                        transition
                        hover:bg-[#EAF8F0]
                      "
                    >
                      Mark all read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(false)
                    }
                    aria-label="Close notifications"
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-lg
                      text-gray-400
                      transition
                      hover:bg-[#EAF8F0]
                      hover:text-[#18613F]
                    "
                  >
                    <X
                      size={15}
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <div
                      className="
                        mx-auto
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-[#EAF8F0]
                        text-[#18B152]
                      "
                    >
                      <Bell
                        size={20}
                        strokeWidth={2.2}
                      />
                    </div>

                    <p className="mt-3 text-xs font-bold text-[#0F3D2E]">
                      No notifications yet
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      You&apos;ll see updates here.
                    </p>
                  </div>
                ) : (

                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
      flex
      w-full
      gap-3
      border-b
      border-[#EDF4EF]
      px-4
      py-3
      text-left
      transition
      last:border-b-0
      hover:bg-[#F5FBF7]
      ${!notification.isRead
                          ? "bg-[#EAF8F0]"
                          : "bg-white"
                        }
    `}
                    >
                      {/* Notification Icon */}
                      <div
                        className="
        mt-0.5
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-lg
        bg-[#EAF8F0]
      "
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Notification Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-[#0F3D2E]">
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#18B152]" />
                          )}
                        </div>

                        <p className="mt-1 text-[11px] leading-4 text-gray-500">
                          {notification.message}
                        </p>

                        <p className="mt-1.5 text-[9px] font-medium text-gray-400">
                          {formatNotificationTime(
                            notification.createdAt
                          )}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        aria-label="Delete notification"
                        title="Delete notification"
                        onClick={() =>
                          handleDeleteNotification(notification)
                        }
                        className="
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        self-start
        rounded-lg
        text-gray-300
        transition
        hover:bg-red-50
        hover:text-red-500
      "
                      >
                        <Trash2
                          size={14}
                          strokeWidth={2.2}
                        />
                      </button>
                    </div>
                  ))

                )}
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            PROFILE
        ===================================================== */}

        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() => {
              setShowProfile(
                (current) => !current
              );

              setShowNotifications(false);
            }}
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-[#DCEDE3]
              bg-white
              px-2
              py-1.5
              shadow-sm
              transition
              hover:border-[#BFE3CD]
              hover:bg-[#F7FCF9]
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
                from-[#18B152]
                to-[#18613F]
                text-[11px]
                font-bold
                text-white
              "
            >
              {initials}
            </div>

            <div className="hidden flex-col sm:flex">
              <span className="text-[9px] text-gray-400">
                Welcome!
              </span>

              <span className="mt-0.5 text-xs font-bold text-[#0F3D2E]">
                {firstName}
              </span>
            </div>

            <ChevronDown
              size={15}
              className={`
                text-[#18B152]
                transition
                ${showProfile
                  ? "rotate-180"
                  : ""
                }
              `}
              strokeWidth={2.5}
            />
          </button>

          {/* Profile Dropdown */}

          {showProfile && (
            <div
              className="
                absolute
                right-0
                top-12
                z-[150]
                w-[290px]
                overflow-hidden
                rounded-2xl
                border
                border-[#DCEDE3]
                bg-white
                shadow-[0_15px_50px_rgba(15,61,46,0.15)]
              "
            >
              {/* User Information */}

              <div
                className="
                  border-b
                  border-[#E8F2EC]
                  bg-gradient-to-br
                  from-[#EAF8F0]
                  to-white
                  px-4
                  py-4
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-[#18B152]
                      to-[#18613F]
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#0F3D2E]">
                      {displayName}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      @{username}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Level */}

              <div className="p-3">
                <div className="rounded-xl bg-[#EAF8F0] px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
                        Referral Level
                      </p>

                      <p className="mt-1 text-sm font-black text-[#18613F]">
                        {referralLevelLabel}
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-gray-400">
                        {referralLevel === 1
                          ? "13% referral commission on your first successful referral investment."
                          : "5% referral commission on future successful referral investments."}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#D4F1DF]
                        text-xs
                        font-black
                        text-[#18B152]
                      "
                    >
                      L{referralLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}

              <div className="border-t border-[#E8F2EC] p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-xs
                    font-bold
                    text-red-500
                    transition
                    hover:bg-red-50
                  "
                >
                  <Power
                    size={17}
                    strokeWidth={2.5}
                  />

                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}

        <div className="hidden h-8 w-px bg-[#DCEDE3] lg:block" />

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
              bg-[#EAF8F0]
              text-[#18B152]
            "
          >
            <Wallet size={19} />
          </div>

          <div className="hidden flex-col md:flex">
            <span className="text-[9px] text-gray-400">
              Balance
            </span>

            <span className="text-sm font-bold text-[#18613F]">
              {liveBalance}
            </span>
          </div>
        </div>

        {/* Divider */}

        <div className="hidden h-8 w-px bg-[#DCEDE3] lg:block" />

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
            text-[#18B152]
            transition
            hover:bg-[#EAF8F0]
            hover:text-[#18613F]
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