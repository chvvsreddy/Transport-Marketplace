"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  CheckCircle,
  Package,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const Heading = dynamic(() => import("@/app/util/Heading/index"));
const CardRevenueSummary = dynamic(() => import("./CardRevenueSummary"));
const CardPerformance = dynamic(() => import("./CardPerformance"));
const StatCard = dynamic(() => import("./StatCard"));

type Props = {};

const Dashboard = (props: Props) => {
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
  });
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setLoggedUser(userObj);
    } else {
      console.log("No user data found in localStorage.");
      router.push("/login");
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
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
    </>
  );
};

export default Dashboard;
