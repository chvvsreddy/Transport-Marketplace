"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Atom,
  BoxIcon,
  ChartBarIncreasing,
  User,
  Layout,
  Menu,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  isCollapsed: boolean;
  hasSubMenu?: boolean; // Added prop to indicate if there are sub-menu options
  subLinks?: { href: string; label: string }[]; // Sub-links for nested menu items
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  hasSubMenu = false,
  subLinks = [],
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleSubMenuToggle = () => {
    if (hasSubMenu) {
      setIsSubMenuOpen(!isSubMenuOpen);
    }
  };

  return (
    <div>
      <div
        onClick={handleSubMenuToggle}
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-3" : "justify-start p-3"
        }
          hover:text-blue-500 hover:bg-white gap-3 mb-2 rounded-md transition-colors ${
            isActive ? "bg-white text-white" : ""
          }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />
        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700`}
        >
          {label}
        </span>
      </div>

      {/* Submenu Links */}
      {isSubMenuOpen && subLinks.length > 0 && (
        <div className={`pl-6 ${isCollapsed ? "hidden" : "block"}`}>
          {subLinks.map((subLink) => (
            <Link href={subLink.href} key={subLink.href}>
              <div className="py-1 px-3 hover:bg-gray-300 rounded-md">
                <span className="text-sm text-gray-600">{subLink.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
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
  } transition-all duration-300 overflow-hidden h-full shadow-md z-40 bg-gray-200`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex justify-between items-center px-4 py-3 border-b border-gray-300`}
      >
        {!isSidebarCollapsed && (
          <Image
            src="/goodseva-logo.png"
            alt="Goodseva-logo"
            width={160}
            height={36}
            className="rounded"
          />
        )}

        {/* Mobile Close Button */}
        <button
          className="md:hidden text-gray-700 hover:text-red-600"
          onClick={toggleSidebar}
        >
          <span className="text-xl font-bold">×</span>
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8 px-4 overflow-y-auto">
        {" "}
        {/* Add scroll functionality here */}
        {/* Overview */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Overview
        </h6>
        <SidebarLink
          href="/login"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        {/* Activity */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Activity
        </h6>
        <SidebarLink
          href="/analytics"
          icon={ChartBarIncreasing}
          label="Analytics"
          isCollapsed={isSidebarCollapsed}
          hasSubMenu
          subLinks={[
            { href: "/analytics/total-users", label: "Total users" },
            { href: "/analytics/loads", label: "Total loads" },
            { href: "/analytics/revenue", label: "Revenue" },
            { href: "/analytics/active-trips", label: "Active trips" },
          ]}
        />
        <SidebarLink
          href="/recent-activities"
          icon={BoxIcon}
          label="Recent Activities"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/system-alerts"
          icon={BoxIcon}
          label="System alerts"
          isCollapsed={isSidebarCollapsed}
        />
        {/* User Management */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          User Management
        </h6>
        <SidebarLink
          href="/user-list"
          icon={User}
          label="User list"
          isCollapsed={isSidebarCollapsed}
          hasSubMenu
          subLinks={[
            { href: "/user-list/shipper", label: "Shipper" },
            { href: "/user-list/driver", label: "Driver" },
            { href: "/user-list/logistics", label: "Logistics Company" },
          ]}
        />
        <SidebarLink
          href="/user-details"
          icon={User}
          label="User details"
          isCollapsed={isSidebarCollapsed}
          hasSubMenu
          subLinks={[
            { href: "/user-details/view", label: "View" },
            { href: "/user-details/edit", label: "Edit" },
            { href: "/user-details/block", label: "Block" },
          ]}
        />
        <SidebarLink
          href="/document-verification"
          icon={BoxIcon}
          label="Document verification"
          isCollapsed={isSidebarCollapsed}
          hasSubMenu
          subLinks={[
            { href: "/document-verification/kyc", label: "KYC" },
            { href: "/document-verification/licenses", label: "Licenses" },
          ]}
        />
        {/* Load Management */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Load Management
        </h6>
        <SidebarLink
          href="/all-loads"
          icon={BoxIcon}
          label="All loads"
          isCollapsed={isSidebarCollapsed}
          hasSubMenu
          subLinks={[
            { href: "/all-loads/available", label: "Available" },
            { href: "/all-loads/assigned", label: "Assigned" },
            { href: "/all-loads/delivered", label: "Delivered" },
          ]}
        />
        <SidebarLink
          href="/load-details"
          icon={BoxIcon}
          label="Load details"
          isCollapsed={isSidebarCollapsed}
        />
        {/* Trip Monitoring */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Trip Monitoring
        </h6>
        <SidebarLink
          href="/live-tracking"
          icon={BoxIcon}
          label="Live tracking"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/trip-history"
          icon={BoxIcon}
          label="Trip history"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/incident-reports"
          icon={BoxIcon}
          label="Incident reports"
          isCollapsed={isSidebarCollapsed}
        />
        {/* Bid & Order Management */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Bid & Order Management
        </h6>
        <SidebarLink
          href="/view-bids"
          icon={BoxIcon}
          label="View all bids"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/order-history"
          icon={BoxIcon}
          label="Order history"
          isCollapsed={isSidebarCollapsed}
          hasSubMenu
          subLinks={[
            { href: "/order-history/status", label: "Filter by status" },
          ]}
        />
        {/* Payments & Settlements */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Payments & Settlements
        </h6>
        <SidebarLink
          href="/transaction-history"
          icon={BoxIcon}
          label="Transaction history"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/payout-approvals"
          icon={BoxIcon}
          label="Payout approvals"
          isCollapsed={isSidebarCollapsed}
        />
        {/* Reports & Analytics */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Reports & Analytics
        </h6>
        <SidebarLink
          href="/revenue-reports"
          icon={ChartBarIncreasing}
          label="Revenue reports"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/user-engagement"
          icon={ChartBarIncreasing}
          label="User engagement metrics"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/trip-performance"
          icon={ChartBarIncreasing}
          label="Trip performance"
          isCollapsed={isSidebarCollapsed}
        />
        {/* System Settings */}
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          System Settings
        </h6>
        <SidebarLink
          href="/admin-roles"
          icon={BoxIcon}
          label="Admin roles & permissions"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/notification-settings"
          icon={BoxIcon}
          label="Notification settings"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/platform-fees"
          icon={BoxIcon}
          label="Platform fees configuration"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500">
          &copy; 2024 Goodseva
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
