"use client";

import {
  Bell,
  Menu,
  Settings,
  Wallet,
  Power,
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  Info,
  AlertCircle,
  X,
} from "lucide-react";

import { useDashboardUI } from "./DashboardUI";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
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
  level1Count?: number;
  level2Count?: number;
};

export default function DashboardHeader({
  fullName = "Humais Ur Rehman",
  balanceStr = "Rs 0.00",
}: DashboardHeaderProps) {
  const { toggleSidebar } = useDashboardUI();
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

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
      const response = await fetch(
        "/api/notifications",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      setNotifications(
        data.notifications ?? []
      );

      setUnreadCount(
        data.unreadCount ?? 0
      );
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
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to mark notifications as read."
      );
    }

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
      const response = await fetch(
        "/api/profile",
        {
          cache: "no-store",
        }
      );

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

  useEffect(() => {
    loadNotifications();
    loadProfile();

    // Refresh notifications periodically.
    const interval = setInterval(
      loadNotifications,
      15000
    );

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

  const handleNotificationClick = async (
    notification: NotificationItem
  ) => {
    if (notification.isRead) {
      return;
    }

    try {
      await fetch(
        `/api/notifications/${notification.id}`,
        {
          method: "PATCH",
        }
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification:",
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

  const level1Count =
  profile?.level1Count ?? 0;

const level2Count =
  profile?.level2Count ?? 0;

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
          className="text-green-500"
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
        className="text-[#4020bd]"
      />
    );
  };

  const formatNotificationTime = (
    date: string
  ) => {
    const notificationDate =
      new Date(date);

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

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

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
          <Menu
            size={24}
            strokeWidth={2.5}
          />
        </button>

        {/* Brand */}

        <div className="flex items-center gap-3">
          <Link
  href="/dashboard"
  aria-label="Prime Way — Home"
  className="flex items-center"
>
  <Image
    src="/images/logo.png"
    alt="Prime Way"
    width={140}
    height={44}
    priority
    className="h-10 w-auto object-contain md:h-11"
  />
</Link>
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
              bg-[#eef0ff]
              text-[#4020bd]
              transition
              hover:bg-[#e1e4ff]
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
                  bg-red-500
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

          {/* Notification Dropdown */}

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
      border-[#e5e8f4]
      bg-white
      shadow-[0_15px_50px_rgba(20,30,80,0.15)]
    "
  >
    {/* Header */}
    <div
      className="
        flex
        items-start
        justify-between
        gap-3
        border-b
        border-[#edf0f7]
        px-4
        py-3.5
      "
    >
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#111b58]">
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
              text-[#4020bd]
              transition
              hover:bg-[#eef0ff]
            "
          >
            Mark all read
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowNotifications(false)}
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
            hover:bg-gray-100
            hover:text-gray-600
          "
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>

    {/* List */}
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
              bg-[#f4f3ff]
              text-[#4020bd]
            "
          >
            <Bell size={20} strokeWidth={2.2} />
          </div>

          <p className="mt-3 text-xs font-bold text-[#111b58]">
            No notifications yet
          </p>

          <p className="mt-1 text-[10px] text-gray-400">
            You&apos;ll see updates here.
          </p>
        </div>
      ) : (
        notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() =>
              handleNotificationClick(notification)
            }
            className={`
              flex
              w-full
              gap-3
              border-b
              border-[#f0f2f7]
              px-4
              py-3
              text-left
              transition
              last:border-b-0
              hover:bg-[#f8f8ff]
              ${
                !notification.isRead
                  ? "bg-[#f6f5ff]"
                  : "bg-white"
              }
            `}
          >
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
                bg-[#eef0ff]
              "
            >
              {getNotificationIcon(notification.type)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-[#111b58]">
                  {notification.title}
                </p>

                {!notification.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#4020bd]" />
                )}
              </div>

              <p className="mt-1 text-[11px] leading-4 text-gray-500">
                {notification.message}
              </p>

              <p className="mt-1.5 text-[9px] font-medium text-gray-400">
                {formatNotificationTime(notification.createdAt)}
              </p>
            </div>
          </button>
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
              border-[#e4e7f5]
              bg-white
              px-2
              py-1.5
              shadow-sm
              transition
              hover:border-[#d9dcf0]
              hover:bg-[#fafaff]
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
              {initials}
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
              className={`text-[#4020bd] transition ${
                showProfile
                  ? "rotate-180"
                  : ""
              }`}
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
                border-[#e5e8f4]
                bg-white
                shadow-[0_15px_50px_rgba(20,30,80,0.15)]
              "
            >
              {/* User information */}

              <div
                className="
                  border-b
                  border-[#edf0f7]
                  bg-gradient-to-br
                  from-[#f7f6ff]
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
                      from-[#4020bd]
                      to-[#063d82]
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#111b58]">
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

              {/* Level */}

              <div className="p-3">
  <div
    className="
      rounded-xl
      bg-[#f5f4ff]
      px-3
      py-3
    "
  >
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
          Referral Network
        </p>

        <p className="mt-1 text-sm font-black text-[#4020bd]">
          My Team
        </p>
      </div>

      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-lg
          bg-[#e9e7ff]
          text-xs
          font-black
          text-[#4020bd]
        "
      >
        2L
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {/* Level 1 */}
      <div className="rounded-lg bg-white px-3 py-2.5">
        <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
          Level 1
        </p>

        <p className="mt-1 text-base font-black text-[#111b58]">
          {level1Count}
        </p>

        <p className="text-[9px] text-gray-400">
          Direct referrals
        </p>
      </div>

      {/* Level 2 */}
      <div className="rounded-lg bg-white px-3 py-2.5">
        <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
          Level 2
        </p>

        <p className="mt-1 text-base font-black text-[#111b58]">
          {level2Count}
        </p>

        <p className="text-[9px] text-gray-400">
          Indirect referrals
        </p>
      </div>
    </div>
  </div>
</div>

              {/* Logout */}

              <div className="border-t border-[#edf0f7] p-2">
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