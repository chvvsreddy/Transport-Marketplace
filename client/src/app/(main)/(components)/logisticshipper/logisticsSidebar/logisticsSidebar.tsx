"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import { setIsSidebarCollapsed } from "@/state";
import {
  BoxIcon,
  ChartBar,
  CircleDollarSign,
  Layout,
  TruckIcon,
  User,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarLinkProps {
  href: string;
  label: string;
  isCollapsed: boolean;
  icon: React.ElementType;
}

// Sidebar link component
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
          isActive ? "bg-violet-100" : "text-gray-700"
        }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />
        <span className={`${isCollapsed ? "hidden" : "block"}`}>{label}</span>
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
    isSidebarCollapsed ? "w-0 md:w-16" : "w-64 md:w-64"
  } transition-all duration-300 overflow-hidden h-full shadow-md z-40 bg-white`;

  return (
    <div className={sidebarClassNames}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        {!isSidebarCollapsed && (
          <Image
            src="/goodseva-logo.png"
            alt="Goodseva-logo"
            width={180}
            height={40}
            className="rounded"
          />
        )}

        {/* Mobile Close Button */}
        <button
          className="md:hidden text-gray-700 hover:text-red-600"
          onClick={toggleSidebar}
        >
          {isSidebarCollapsed ? (
            <Menu className="w-6 h-6" />
          ) : (
            <X className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Links */}
      <div className="flex-grow mt-8 px-4 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2">
        <h6
          className={`${isSidebarCollapsed ? "hidden" : "block"} nav-subhead`}
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
          className={`${isSidebarCollapsed ? "hidden" : "block"} nav-subhead `}
        >
          Management
        </h6>
        <SidebarLink
          href="/myloads"
          icon={TruckIcon}
          label="Load Management"
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
          label="Profile & Settings"
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
