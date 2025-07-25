"use client";

import "@ant-design/v5-patch-for-react-19";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { SearchProvider } from "../util/SearchContext";
import { UserProvider, useUser } from "../util/UserContext";
import { SocketProvider } from "../util/SocketContext";
import { useRouter } from "next/navigation";
import Shimmer from "./(components)/shimmerUi/Shimmer";
import { RegistrationProvider } from "../util/RegistrationContext";
import { getLoggedUserFromLS, LoggedUser } from "../util/getLoggedUserFromLS";

// const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
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
const Navbar = dynamic(() => import("@/app/util/Navbar/Navbar"), {
  ssr: false,
});
const BottomNav = dynamic(() => import("../util/BottomNav"), { ssr: false });
const DriverHeader = dynamic(() => import("../util/DriverHeader"), {
  ssr: false,
});
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
    userId: "",
    email: "",
    phone: "",
    type: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isCompanyShipper, setIsCompanyShipper] = useState(false);
  const [isLogisticShipper, setIsLogisticShipper] = useState(false);
  const [isIndividualShipper, setIsIndividualShipper] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isVerified } = useUser();
  const router = useRouter();

  useEffect(() => {
    const storedUser = getLoggedUserFromLS();
    if (storedUser) {
      try {
        const userObj: LoggedUser = storedUser;
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
      case "INDIVIDUAL_DRIVER":
        setIsDriver(true);
        break;
      default:
        break;
    }
    setIsLoading(false);
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

  return isLoading ? (
    <Shimmer />
  ) : (
    <div
      className={`flex bg-gray-50 text-gray-900 w-full min-h-screen ${
        isDarkMode ? "dark" : "light"
      }`}
      id="fordash"
    >
      {isAdmin && <AdminSidebar />}
      {isIndividualShipper && isVerified && <IndividualShipperSidebar />}
      {isLogisticShipper && isVerified && <LogisticsShipperSidebar />}
      {isCompanyShipper && isVerified && <CompanyShipperSidebar />}

      <main
        className={`flex flex-col w-full h-full bg-gray-100 pb-6 pr-2 ${
          isDriver && isVerified
            ? "max-w-[1200px] mx-auto py-14 pl-2 pr-2"
            : isSidebarCollapsed
            ? "md:pl-16"
            : "md:pl-64"
        }`}
      >
        {isDriver ? <DriverHeader /> : <Navbar />}

        {children}

        {isDriver && <BottomNav />}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <SearchProvider>
        <UserProvider>
          <SocketProvider>
            <RegistrationProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </RegistrationProvider>
          </SocketProvider>
        </UserProvider>
      </SearchProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;
