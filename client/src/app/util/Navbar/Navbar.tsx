"use client";

import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, Sun, Moon, Settings } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkmode, setIsSidebarCollapsed } from "@/state";
import { useRouter } from "next/navigation";
import { useSearch } from "../SearchContext";
import { Avatar, message } from "antd";
import { UserOutlined } from "@ant-design/icons";

const Navbar = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const { setSearchTerm } = useSearch();

  const [searchValue, setSearchValue] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    type: "",
    email: "",
    phone: "",
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setLoggedUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.success("User loggedOut Successful");
    setLoggedUser({ message: "", userId: "", type: "", email: "", phone: "" });
    router.push("/login");
  };

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkmode = () => {
    dispatch(setIsDarkmode(!isDarkMode));
  };

  // Debouncing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setSearchTerm(searchValue);
    }, 300);
  }, [searchValue, setSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-between items-center gap-5 mb-5 p-2 px-5 border-b bg-white border-neutral-300">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="relative">
          <input
            type="search"
            placeholder="Start typing to search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-4 py-2 w-50 md:w-60 border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Bell className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <button onClick={toggleDarkmode}>
            {isDarkMode ? (
              <Sun className="cursor-pointer text-gray-500" size={24} />
            ) : (
              <Moon className="cursor-pointer text-gray-500" size={24} />
            )}
          </button>

          <div className="relative">
            <Bell className="cursor-pointer text-gray-500" size={24} />
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              0
            </span>
          </div>

          <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />

          <div className="flex flex-row items-start gap-1  cursor-pointer">
            <div>
              <Avatar size={45} icon={<UserOutlined />} />
            </div>
            <div className="flex flex-col mt-1">
              <span className="font-semibold">
                {loggedUser.email ? loggedUser.email.split("@")[0] : ""}
              </span>
              <span className="text-sm">
                {loggedUser.type ? loggedUser.type.toLowerCase() : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button onClick={() => setSettingsOpen((prev) => !prev)}>
            <Settings className="cursor-pointer text-gray-500" size={24} />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 border">
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setSettingsOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
