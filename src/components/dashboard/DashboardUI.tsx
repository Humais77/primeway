"use client";

import { createContext, useContext, useState } from "react";
import DashboardSidebar from "./DashboardSidebar";

type DashboardUIContextType = {
  openSidebar: () => void;
  closeSidebar: () => void;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardUIContext.Provider
      value={{
        openSidebar: () => setSidebarOpen(true),
        closeSidebar: () => setSidebarOpen(false),
      }}
    >
      {children}

      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        fullName={fullName}
        userId={userId}
      />
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