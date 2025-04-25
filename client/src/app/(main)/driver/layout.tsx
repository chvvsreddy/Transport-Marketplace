"use client";

import DriverHeader from "./components/DriverHeader";
import BottomNav from "./components/BottomNav";
import StoreProvider, { useAppSelector } from "@/app/redux";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
 
      <main className="flex-1 overflow-y-auto pt-16 pb-20">
        <div className="max-w-[800px] mx-auto w-full px-4">
          <div className="space-y-4 pt-2 pb-4">{children}</div>
        </div>
      </main>
     
    </StoreProvider>
  );
}
