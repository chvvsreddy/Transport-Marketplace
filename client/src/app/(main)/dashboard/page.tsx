"use client";
import React, { useEffect, useState } from "react";
import { Package, Tag, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useUser } from "@/app/util/UserContext";
import { Button } from "antd";
import LoadTable from "./LoadsDash";
import MonthlyLoadCard from "./components/MontlyLoads";
import MonthlyLoadsChart from "./components/MontlyLoads";
import BidPriceTrendChart from "./components/BidPriceTrend";
import BidStatusBarChart from "./components/BidStatusBarChart";
const Heading = dynamic(() => import("@/app/util/Heading/index"), {
  loading: () => <h2>Loading Heading...</h2>,
});
const StatCard = dynamic(() => import("./StatCard"), {
  loading: () => <p>Loading Stat Card...</p>,
});
const CardRevenueSummary = dynamic(() => import("./CardRevenueSummary"), {
  loading: () => <p>Loading Revenue Summary...</p>,
});
const CardPerformance = dynamic(() => import("./CardPerformance"), {
  loading: () => <p>Loading Performance...</p>,
});
const mockLoadData = [
  { date: "Jun 1", count: 5 },
  { date: "Jun 2", count: 7 },
  { date: "Jun 3", count: 3 },
  { date: "Jun 4", count: 9 },
  { date: "Jun 5", count: 6 },
  { date: "Jun 6", count: 8 },
  { date: "Jun 7", count: 4 },
];

const bidPriceData = [
  { date: "Jun 1", price: 1200 },
  { date: "Jun 2", price: 1250 },
  { date: "Jun 3", price: 1100 },
  { date: "Jun 4", price: 1350 },
  { date: "Jun 5", price: 1300 },
];

const bidStatusData = [
  { date: "Jun 1", accepted: 5, rejected: 2 },
  { date: "Jun 2", accepted: 3, rejected: 1 },
  { date: "Jun 3", accepted: 6, rejected: 4 },
  { date: "Jun 4", accepted: 4, rejected: 3 },
];
const Dashboard = () => {
  const [loggedUser, setLoggedUser] = useState({
    message: "",
    userId: "",
    email: "",
    phone: "",
    type: "",
  });
  const router = useRouter();
  const { setUser } = useUser();

  useEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setLoggedUser(userObj);
      setUser(userObj);
    } else {
      router.push("/login");
    }
  }, []);

  return (
    <>
      <Heading name="Dashboard" />
      <div className="product-adve flex justify-between">
        <div className="p-6">
          <p className="text-white text-xl font-semibold">
            A complete Vehicle, Driver security & Monitoring system
          </p>
          <Button className="mt-4">Know More</Button>
        </div>
        <img src="/advt-1.jpg" alt="" />
      </div>
      <div className="main-content">
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
          <div className="xl:col-span-3">
            <LoadTable />
          </div>
        
            <MonthlyLoadsChart data={mockLoadData} />
            <BidPriceTrendChart data={bidPriceData} />
            <BidStatusBarChart data={bidStatusData} />
         
          {/* Add more cards if needed */}
          {/* other StatCards... */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
