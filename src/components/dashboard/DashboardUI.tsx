
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import DashboardSidebar from "./DashboardSidebar";

type DashboardUIContextType = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const DashboardUIContext =
  createContext<DashboardUIContextType | null>(null);

export function DashboardUIProvider({
  children,
  fullName,
  userId,
}: {
  children: React.ReactNode;
  fullName: string;
  userId: string;
}) {
  /*
   * IMPORTANT:
   *
   * Start closed during SSR/hydration.
   *
   * This prevents us from using window during the initial render,
   * which can cause a hydration mismatch.
   *
   * After mount:
   * - Desktop (>= 1024px): sidebar opens
   * - Mobile/tablet (< 1024px): sidebar stays closed
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px)"
    );

    // Desktop opens automatically after hydration.
    if (mediaQuery.matches) {
      setSidebarOpen(true);
    }

    /*
     * Only react when crossing the desktop/mobile breakpoint.
     * Do NOT continuously overwrite sidebarOpen on every resize.
     */
    const handleBreakpointChange = (
      event: MediaQueryListEvent
    ) => {
      if (event.matches) {
        // Entering desktop
        setSidebarOpen(true);
      } else {
        // Entering mobile/tablet
        setSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleBreakpointChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleBreakpointChange
      );
    };
  }, []);

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <DashboardUIContext.Provider
      value={{
        sidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      <div className="min-h-screen w-full bg-[#F5F8F5]">
        <DashboardSidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          fullName={fullName}
          userId={userId}
        />

        <div
          className={`
            min-h-screen
            bg-[#F5F8F5]
            transition-[padding]
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
            ${
              sidebarOpen
                ? "lg:pl-[245px]"
                : "lg:pl-0"
            }
          `}
        >
          {children}
        </div>
      </div>
    </DashboardUIContext.Provider>
  );
}

export function useDashboardUI() {
  const context = useContext(DashboardUIContext);

  if (!context) {
    throw new Error(
      "useDashboardUI must be used inside DashboardUIProvider"
    );
  }

  return context;
}
