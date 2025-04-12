"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Atom,
  Binary,
  BoxIcon,
  ChartBarIncreasing,
  CircleDollarSign,
  Layout,
  LucideIcon,
  Menu,
  Telescope,
  TruckIcon,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

// Types
interface SubItem {
  href: string;
  label: string;
}

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  subItems?: SubItem[];
}

// Sidebar Link Component
const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  subItems,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === href;

  const hasSubItems = subItems && subItems.length > 0;

  return (
    <div>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-3" : "justify-start p-3"
        } hover:text-blue-500 hover:bg-white gap-3 mb-2 rounded-md transition-colors ${
          isActive ? "bg-white text-white" : ""
        }`}
        onClick={() => hasSubItems && setIsOpen(!isOpen)}
      >
        <Icon className="w-6 h-6 !text-gray-700" />
        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700`}
        >
          {label}
        </span>
        {hasSubItems && !isCollapsed && (
          <span className="ml-auto">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </div>
      {!isCollapsed && hasSubItems && isOpen && (
        <div className="ml-8">
          {subItems.map((sub, idx) => (
            <Link href={sub.href} key={idx}>
              <div className="text-sm text-gray-600 p-2 hover:text-blue-600 transition-colors">
                {sub.label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Sidebar
const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

const sidebarClassNames = `fixed top-0 left-0 flex flex-col h-full z-50 bg-gray-200 shadow-md transition-transform duration-300 
  ${
    isSidebarCollapsed
      ? "-translate-x-full md:translate-x-0 md:w-16"
      : "translate-x-0 w-72 md:w-64"
  }`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-300">
        {/* Logo - hide when collapsed */}
        <h1 className={`${isSidebarCollapsed ? "hidden" : "block"}`}>
          <Image
            src="/goodseva-logo.png"
            alt="Goodseva-logo"
            width={160}
            height={36}
            className="rounded"
          />
        </h1>

        {/* Mobile Close Button */}
        <button
          className="md:hidden text-gray-700 hover:text-red-600"
          onClick={toggleSidebar}
        >
          <span className="text-2xl font-bold">×</span>
        </button>
      </div>

      {/* LINKS */}

      {/* LINKS with SCROLLBAR */}
      <div className="flex-grow mt-8 px-4 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pr-2">
        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
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
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Activity
        </h6>

        <SidebarLink
          href="#"
          icon={BoxIcon}
          label="Available Loads"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="#"
          icon={CircleDollarSign}
          label="Bidding System"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="#"
          icon={TruckIcon}
          label="Trip Management"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="#"
          icon={ChartBarIncreasing}
          label="Earnings & Payments"
          isCollapsed={isSidebarCollapsed}
        />

        <SidebarLink
          href="#"
          icon={User}
          label="Profile"
          isCollapsed={isSidebarCollapsed}
        />

        <h6
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-normal text-sm p-2 text-neutral-500`}
        >
          Others
        </h6>
        <SidebarLink
          href="/"
          icon={Atom}
          label="Tools"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/"
          icon={Telescope}
          label="Explore"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/"
          icon={Binary}
          label="Rates"
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
