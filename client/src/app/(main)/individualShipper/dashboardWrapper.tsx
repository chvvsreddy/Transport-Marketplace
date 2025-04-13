"use client";

import React, { useEffect } from "react";
//import Navbar from "./components/shipperNavbar/page";
import Sidebar from "./components/shipperSidebar/page";
import StoreProvider, { useAppSelector } from "@/app/redux";
import Navbar from "@/app/util/Navbar/page";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {}, []);
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  });

  return (
    <div
      className={` flex bg-gray-50 text-gray-900 w-full min-h-screen ${
        isDarkMode ? "dark" : "light"
      }`}
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full bg-gray-50 py-3 pb-6 px-9 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <Navbar/>
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
