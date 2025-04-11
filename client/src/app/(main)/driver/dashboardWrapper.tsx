"use client";

import React, { useEffect, useState } from "react";
import Navbar from "./components/driverNavbar/page";
import Sidebar from "./components/driverSidebar/page";
import StoreProvider, { useAppSelector } from "@/app/redux";
import DriverMobileHeader from "@/app/(main)/driver/components/DriverMobileHeader";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div
      className={`flex bg-gray-50 text-gray-900 w-full min-h-screen ${
        isDarkMode ? "dark" : "light"
      }`}
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full bg-gray-50 py-3 pb-6 px-9 ${
          isSidebarCollapsed ? "pl-20" : "pl-72"
        }`}
      >
        {isMobile ? <DriverMobileHeader /> : <Navbar />}

        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
