"use client";

import { createContext, useContext, useState } from "react";
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
  // Sidebar is OPEN when dashboard loads
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <DashboardUIContext.Provider
      value={{
        sidebarOpen,

        openSidebar: () => setSidebarOpen(true),

        closeSidebar: () => setSidebarOpen(false),

        toggleSidebar: () =>
          setSidebarOpen((prev) => !prev),
      }}
    >
      <div className="min-h-screen w-full bg-[#f5f7fb]">
        {/* ======================================================
            SIDEBAR
            Starts BELOW the header
        ====================================================== */}
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          fullName={fullName}
          userId={userId}
        />

        {/* ======================================================
            PAGE CONTENT
        ====================================================== */}
        <div
          className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
            sidebarOpen
              ? "lg:pl-[245px]"
              : "lg:pl-0"
          }`}
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