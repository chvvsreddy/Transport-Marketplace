"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Atom,
  BoxIcon,
  ChartBar,
  CircleDollarSign,
  Layout,
  Menu,
  TruckIcon,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

// Sidebar link component
const SidebarLink = ({
  href,
  label,
  isCollapsed,
}: {
  href: string;
  label: string;
  isCollapsed: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href}>
      <div
        className={`cursor-pointer text-sm px-3 py-2 rounded-md ${
          isActive ? "bg-white text-blue-500" : "text-gray-700"
        } hover:bg-white hover:text-blue-500 transition-colors`}
      >
        {!isCollapsed && label}
      </div>
    </Link>
  );
};

// Collapsible group component
const SidebarLinkGroup = ({
  icon: Icon,
  label,
  isCollapsed,
  links,
}: {
  icon: any;
  label: string;
  isCollapsed: boolean;
  links: { href: string; label: string }[];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <div
        className={`flex items-center cursor-pointer ${
          isCollapsed ? "justify-center py-3" : "justify-start p-3"
        } gap-3 hover:bg-white rounded-md transition-colors`}
        onClick={() => setOpen(!open)}
      >
        <Icon className="w-5 h-5 text-gray-700" />
        {!isCollapsed && (
          <span className="font-medium text-gray-700">{label}</span>
        )}
      </div>
      {open && !isCollapsed && (
        <div className="ml-8">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={link.label}
              isCollapsed={isCollapsed}
            />
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

        {/* Mobile Close Button */}
        <button
          className="md:hidden text-gray-700 hover:text-red-600"
          onClick={toggleSidebar}
        >
          <span className="text-2xl font-bold">×</span>
        </button>
      </div>

      {/* Scrollable Links */}
      <div className="flex-grow mt-8 px-4 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2">
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Main
        </h6>
        <SidebarLinkGroup
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
          links={[{ href: "/dashboard", label: "Dashboard" }]}
        />

        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Management
        </h6>

        <SidebarLinkGroup
          icon={TruckIcon}
          label="Load Management"
          isCollapsed={isSidebarCollapsed}
          links={[
            { href: "/loads/post", label: "Post a New Load" },
            { href: "/loads/map", label: "Origin/Destination Map" },
            { href: "/loads/details", label: "Cargo Details" },
            { href: "/loads/time-slots", label: "Pickup/Delivery Time" },
            { href: "/loads/special", label: "Special Requirements" },
            { href: "/loads/my", label: "My Loads" },
            { href: "/loads/active", label: "Active Loads" },
          ]}
        />

        <SidebarLinkGroup
          icon={BoxIcon}
          label="Bids & Orders"
          isCollapsed={isSidebarCollapsed}
          links={[
            { href: "/bids/view", label: "View Bids" },
            { href: "/bids/confirm", label: "Accept/Reject Bids" },
            { href: "/orders/confirmation", label: "Order Confirmation" },
          ]}
        />

        <SidebarLinkGroup
          icon={ChartBar}
          label="Trip Tracking"
          isCollapsed={isSidebarCollapsed}
          links={[
            { href: "/trip/status", label: "Live Trip Status" },
            { href: "/trip/updates", label: "Delivery Updates" },
            { href: "/trip/documents", label: "Upload Documents" },
          ]}
        />

        <SidebarLinkGroup
          icon={CircleDollarSign}
          label="Payments"
          isCollapsed={isSidebarCollapsed}
          links={[
            { href: "/payments/history", label: "Payment History" },
            { href: "/payments/invoices", label: "Invoice Generation" },
          ]}
        />

        <SidebarLinkGroup
          icon={User}
          label="Profile & Settings"
          isCollapsed={isSidebarCollapsed}
          links={[
            { href: "/profile/company", label: "Company/Individual Details" },
            { href: "/profile/documents", label: "Upload Documents" },
            {
              href: "/profile/notifications",
              label: "Notification Preferences",
            },
          ]}
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
