"use client";

import { createContext, useContext, useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";

type DashboardUIContextType = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const DashboardUIContext = createContext<DashboardUIContextType | null>(null);

export function DashboardUIProvider({
  children,
  fullName,
  userId,
}: {
  children: React.ReactNode;
  fullName: string;
  userId: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Automatically open sidebar on desktop when the website loads
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <DashboardUIContext.Provider
      value={{
        sidebarOpen,
        openSidebar: () => setSidebarOpen(true),
        closeSidebar: () => setSidebarOpen(false),
        toggleSidebar: () => setSidebarOpen((prev) => !prev),
      }}
    >
      <div className="flex min-h-screen w-full bg-[#f4f7fa]">
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          fullName={fullName}
          userId={userId}
        />

        {/* Main Content Wrapper - Shifts when sidebar is open */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "lg:pl-[260px]" : "pl-0"
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