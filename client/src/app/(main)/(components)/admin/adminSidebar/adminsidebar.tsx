"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { setIsSidebarCollapsed } from "@/state";
import {
  BoxIcon,
  ChartBarIncreasing,
  User,
  Layout,
  TruckIcon,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();

  const isActive =
    "/" + pathname.split("/")[1] === href ||
    (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-3" : "justify-start p-3"
        } hover:text-blue-500 hover:bg-white gap-3 mb-2 rounded-md transition-colors ${
          isActive ? "bg-violet-100" : "text-gray-700"
        }`}
      >
        <Icon className="w-6 h-6" />
        {!isCollapsed && (
          <span className="font-medium text-gray-700">{label}</span>
        )}
      </div>
    </Link>
  );
};

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
        {!isSidebarCollapsed && (
          <Image
            src="/goodseva-logo.png"
            alt="Goodseva-logo"
            width={160}
            height={36}
            className="rounded"
          />
        )}

        <button
          className="md:hidden text-gray-700 hover:text-red-600"
          onClick={toggleSidebar}
        >
          <span className="text-xl font-bold">×</span>
        </button>
      </div>

      {/* Links */}
      <div className="flex-grow mt-8 px-4 overflow-y-auto">
        <h6 className={`${ isSidebarCollapsed ? "hidden" : "block" } nav-subhead`} >
          Overview
        </h6>

        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/usermanagement"
          icon={User}
          label="User Management"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/myloads"
          icon={TruckIcon}
          label="Load Management"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/trips"
          icon={DollarSign}
          label="Trip Monitoring"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/bids&orders"
          icon={BoxIcon}
          label="Bid & Order Management"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/payments"
          icon={DollarSign}
          label="Payments & Settlements"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/reports"
          icon={ChartBarIncreasing}
          label="Reports & Analytics"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/systemSettings"
          icon={BoxIcon}
          label="System Settings"
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
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500">
          &copy; 2024 Goodseva
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
