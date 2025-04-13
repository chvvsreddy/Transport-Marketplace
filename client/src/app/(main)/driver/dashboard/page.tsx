"use client";
import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  Package,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// ⏬ Dynamic Imports
const Heading = dynamic(() => import("@/app/util/Heading/index"), {
  loading: () => <h2>Loading Dashboard...</h2>,
});
const StatCard = dynamic(() => import("./StatCard"), {
  loading: () => <div>Loading Stat Card...</div>,
});
const CardRevenueSummary = dynamic(() => import("./CardRevenueSummary"), {
  loading: () => <div>Loading Revenue Summary...</div>,
});
const CardPerformance = dynamic(() => import("./CardPerformance"), {
  loading: () => <div>Loading Performance...</div>,
});
const MobileBottomNav = dynamic(
  () => import("@/app/(main)/driver/components/BottomNav"),
  {
    ssr: false,
    loading: () => <div>Loading Navigation...</div>,
  }
);

const Dashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState({ message: "", userId: "" });
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setLoggedUser(userObj);
    } else {
      router.push("/login");
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedUser({ message: "", userId: "" });
    router.push("/");
  };

  return (
    <>
      <Heading name="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pt-5 pb-4">
        <CardRevenueSummary />
        <CardPerformance />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-16 custom-grid-rows">
        <StatCard
          title="Customer & Expenses"
          primaryIcon={<Package className="text-blue-600 w-6 h-6" />}
          dateRange="22 - 29 October 2023"
          details={[
            {
              title: "Customer Growth",
              amount: "175.00",
              changePercentage: 131,
              IconComponent: TrendingUp,
            },
            {
              title: "Expenses",
              amount: "10.00",
              changePercentage: -56,
              IconComponent: TrendingDown,
            },
          ]}
        />
        <StatCard
          title="Dues & Pending Orders"
          primaryIcon={<CheckCircle className="text-blue-600 w-6 h-6" />}
          dateRange="22 - 29 October 2023"
          details={[
            {
              title: "Dues",
              amount: "250.00",
              changePercentage: 131,
              IconComponent: TrendingUp,
            },
            {
              title: "Pending Orders",
              amount: "147",
              changePercentage: -56,
              IconComponent: TrendingDown,
            },
          ]}
        />
        <StatCard
          title="Sales & Discount"
          primaryIcon={<Tag className="text-blue-600 w-6 h-6" />}
          dateRange="22 - 29 October 2023"
          details={[
            {
              title: "Sales",
              amount: "1000.00",
              changePercentage: 20,
              IconComponent: TrendingUp,
            },
            {
              title: "Discount",
              amount: "200.00",
              changePercentage: -10,
              IconComponent: TrendingDown,
            },
          ]}
        />
      </div>

      {isMobile && <MobileBottomNav />}
    </>
  );
};

export default Dashboard;
