"use client";

import React, { useEffect } from "react";
//import Navbar from "./components/adminNavbar/page";
import Sidebar from "./components/adminSidebar/page";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { SearchProvider } from "../../util/SearchContext";
import { UserProvider } from "../../util/UserContext"; 
import Navbar from "@/app/util/Navbar/page";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

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
      id="fordash"
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full bg-gray-50 py-3 pb-6 px-9 ${
          isSidebarCollapsed ? "md:pl-24" : "md:pl-72"
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <SearchProvider>
        <UserProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </UserProvider>
      </SearchProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;
