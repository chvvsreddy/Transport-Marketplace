"use client";

import { TruckIcon, Layout, MessagesSquare, User, Map } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/loads", label: "Loads", icon: Map },
  { href: "/trips", label: "Trips", icon: Layout },
  { href: "/trucks", label: "Trucks", icon: TruckIcon },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/profile", label: "Account", icon: User },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner ">
      <nav className="max-w-[800px] mx-auto w-full flex justify-around items-center py-2 z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              href={item.href}
              key={item.label}
              className="flex flex-col items-center justify-center text-xs"
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span
                className={`${
                  isActive ? "text-blue-600" : "text-gray-500"
                } text-xs`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
