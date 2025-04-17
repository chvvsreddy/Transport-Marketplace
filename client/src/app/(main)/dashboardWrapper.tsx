"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { SearchProvider } from "../util/SearchContext";
import { UserProvider } from "../util/UserContext";
import Navbar from "@/app/util/Navbar/Navbar";
import { useRouter } from "next/navigation";


const AdminSidebar = dynamic(
  () => import("./(components)/admin/adminSidebar/adminsidebar"),
  { ssr: false }
);
const IndividualShipperSidebar = dynamic(
  () =>
    import(
      "./(components)/individualshipper/shipperSidebar/IndividualShipperSidebar"
    ),
  { ssr: false }
);
const LogisticsShipperSidebar = dynamic(
  () =>
    import("./(components)/logisticshipper/logisticsSidebar/logisticsSidebar"),
  { ssr: false }
);
const CompanyShipperSidebar = dynamic(
  () =>
    import(
      "./(components)/companyshipper/shipperSidebar/CompanyShipperSidebar"
    ),
  { ssr: false }
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    email: "",
    phone: "",
    type: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompanyShipper, setIsCompanyShipper] = useState(false);
  const [isLogisticShipper, setIsLogisticShipper] = useState(false);
  const [isIndividualShipper, setIsIndividualShipper] = useState(false);

  const router = useRouter();


  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setLoggedUser(userObj);
      } catch (error) {
        console.error("Error parsing user:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);


  useEffect(() => {
    switch (loggedUser.type) {
      case "ADMIN":
        setIsAdmin(true);
        break;
      case "SHIPPER_COMPANY":
        setIsCompanyShipper(true);
        break;
      case "INDIVIDUAL_SHIPPER":
        setIsIndividualShipper(true);
        break;
      case "LOGISTICS_COMPANY":
        setIsLogisticShipper(true);
        break;
      default:
        break;
    }
  }, [loggedUser]);

 
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
      {isAdmin && <AdminSidebar />}
      {isIndividualShipper && <IndividualShipperSidebar />}
      {isLogisticShipper && <LogisticsShipperSidebar />}
      {isCompanyShipper && <CompanyShipperSidebar />}
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
