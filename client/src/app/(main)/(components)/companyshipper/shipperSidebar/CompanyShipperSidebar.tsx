"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
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

// SidebarLink Component
const SidebarLink = ({
  href,
  label,
  isCollapsed,
  icon: Icon,
}: {
  href: string;
  label: string;
  isCollapsed: boolean;
  icon: any;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-3" : "justify-start p-3"
        } hover:text-blue-500 hover:bg-white gap-3 mb-2 rounded-md transition-colors ${
          isActive ? "bg-white text-white" : ""
        }`}
      >
        <Icon className="w-6 h-6 text-gray-700" />
        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700`}
        >
          {label}
        </span>
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
  } transition-all duration-300 overflow-hidden h-full shadow-md z-40 bg-gray-200`;

  return (
    <div className={sidebarClassNames}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        {!isSidebarCollapsed && (
          <Image
            src="/goodseva-logo.png"
            alt="Goodseva-logo"
            width={180}
            height={36}
            className="rounded"
          />
        )}

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
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Main
        </h6>

        <SidebarLink
          href="dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />

        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Management
        </h6>

        <SidebarLink
          href="/postload"
          icon={TruckIcon}
          label="Post a load"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href=""
          icon={TruckIcon}
          label="My Loads"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="bids&orders"
          icon={BoxIcon}
          label="Bids & Orders"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="triptracking"
          icon={ChartBar}
          label="Trips"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="payments"
          icon={CircleDollarSign}
          label="Earnings & payments"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="user"
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
