"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import Image from "next/image";
import { Settings } from "lucide-react";
import Link from "next/link";
import { message } from "antd";

export default function DriverHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    type: "",
    email: "",
  });
  const router = useRouter();
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedUser({ message: "", userId: "", type: "", email: "" });
    message.success("loggedout successful");
    router.push("/login");
  };
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  //   const toggleSidebar = () => {
  //     dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  //   };
  //   const toggleDarkmode = () => {
  //     dispatch(setIsDarmode(!isDarkMode));
  //   };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white px-4 py-3 shadow-md z-10 ">
        <div className="flex justify-between max-w-[900px] mx-auto w-full">
          <Image
            src="/goodseva-logo.png"
            alt="Goodseva-logo"
            width={200}
            height={24}
            className="rounded"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {loggedUser?.email.split("@")[0]}
            </span>

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
      </header>
    </>
  );
}
