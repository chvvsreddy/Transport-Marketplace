"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { setIsSidebarCollapsed } from "@/state";

import {
  BoxIcon,
  ChartBar,
  CircleDollarSign,
  Layout,
  Menu,
  TruckIcon,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { SidebarLinkProps } from "../../logisticshipper/logisticsSidebar/logisticsSidebar";

// SidebarLink Component
const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  label,
  isCollapsed,
  icon: Icon,
}) => {
  const pathname = usePathname();
  const isActive = "/" + pathname.split("/")[1] === href;

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-3" : "justify-start p-3"
        } hover:text-blue-500 hover:bg-white gap-3 mb-2 rounded-md transition-colors ${
          isActive ? "bg-violet-100" : ""
        }`}
      >
        <Icon className="w-6 h-6 text-gray-700" />
        <span className={`${isCollapsed ? "hidden" : "block"} `}>{label}</span>
      </div>
    </Link>
  );
};

// Sidebar Component
const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } transition-all duration-300 overflow-hidden h-full shadow-md z-40 bg-white`;

  return (
    <div className={sidebarClassNames}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        <div style={{ height: "37px" }}>
          {!isSidebarCollapsed && (
            <Image
              src="/goodseva-logo.png"
              alt="Goodseva-logo"
              width={180}
              height={36}
              className="rounded"
            />
          )}
        </div>

        {/* Toggle Button (Mobile) */}
        <button
          className="md:hidden p-2 rounded hover:bg-white hover:text-red-600 transition-colors"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? (
            <Menu className="w-6 h-6 text-gray-700" />
          ) : (
            <X className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Links */}
      <div className="flex-grow mt-8 px-4 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2">
        <h6
          className={`${isSidebarCollapsed ? "hidden" : "block"}  nav-subhead`}
        >
          Overview
        </h6>

        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />

        <h6
          className={`${isSidebarCollapsed ? "hidden" : "block"}  nav-subhead`}
        >
          Management
        </h6>
        <SidebarLink
          href="/myloads"
          icon={TruckIcon}
          label="Loads"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/postload"
          icon={TruckIcon}
          label="Post a load"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/bids&orders"
          icon={BoxIcon}
          label="Bids & Orders"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/trips"
          icon={ChartBar}
          label="Trip Tracking"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/payments"
          icon={CircleDollarSign}
          label="Payments"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href={`/profile?userId=${getLoggedUserFromLS().userId}`}
          icon={User}
          label="Profile"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Footer */}
      {!isSidebarCollapsed && (
        <div className="mb-10">
          <p className="text-center text-xs text-gray-500">
            &copy; 2024 Goodseva
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
