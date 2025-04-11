"use client";

import {
  TruckIcon,
  
  Layout,
  MessagesSquare,
  User,
  Map,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/loads/post", label: "Loads", icon: Map },
  { href: "/trip/status", label: "Trips", icon: Layout },
  { href: "/trucks", label: "Trucks", icon: TruckIcon },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/profile/company", label: "Account", icon: User },
];

const MobileBottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around items-center py-2 md:hidden z-50">
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
  );
};

export default MobileBottomNav;
