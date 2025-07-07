"use client";
import React, { useLayoutEffect, useState } from "react";
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
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const router = useRouter();
  const { setUser } = useUser();

  useLayoutEffect(() => {
    const storedUser = localStorage.getItem("token");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setLoggedUser(userObj);
      setUser(userObj);
      if (userObj.type === "INDIVIDUAL_DRIVER") {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, []);

  //   useEffect(() => {
  //   const fetchData = async () => {
  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/summary?month=${selectedMonth}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     const json = await res.json();
  //     setData(json);
  //   };

  //   fetchData();
  // }, [selectedMonth]);

  const data = {
    totalLoads: 120,
    completedLoads: 90,
    inTransitLoads: 20,
    totalRevenue: 250000,
    pendingRevenue: 50000,
  };

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
      <div className="px-6 pb-6 flex items-center justify-end gap-4 mt-6 ">
        <label
          htmlFor="month"
          className="text-base font-semibold text-gray-800"
        >
          Select Month:
        </label>
        <div className="relative">
          <input
            id="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-35 border border-none shadow-none px-4 py-3 text-base text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        
        </div>
      </div>

      <section className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Loads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full mb-5">
                <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Total Loads</p>
                  <h3 className="text-2xl font-bold mt-1">{data.totalLoads}</h3>
                </div>
                <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Completed Loads</p>
                  <h3 className="text-2xl font-bold text-green-500 mt-1">
                    {data.completedLoads}
                  </h3>
                </div>
                <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                  <p className="text-gray-500 text-sm">In Transit</p>
                  <h3 className="text-2xl font-bold text-yellow-500 mt-1">
                    {data.inTransitLoads}
                  </h3>
                </div>
              </div>
            <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
              
              <div className="w-full">
                      <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Loads Trend
                  </h2>
                <MonthlyLoadsChart data={mockLoadData} />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Revenue
            </h2> 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full mb-5">
                <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">
                    ₹{data.totalRevenue}
                  </h3>
                </div>
                <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Fullfilled Revenue</p>
                  <h3 className="text-2xl font-bold text-green-500 mt-1">
                    ₹{data.pendingRevenue}
                  </h3>
                </div>
                <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                  <p className="text-gray-500 text-sm">Pending Revenue</p>
                  <h3 className="text-2xl font-bold text-red-500 mt-1">
                    ₹{data.pendingRevenue}
                  </h3>
                </div>
              </div>
            <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
             
               <div className="w-full">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Revenue Trend
                </h2>
               <MonthlyLoadsChart data={mockLoadData} />
            </div>
            </div>
          </div>
        </div>
      </section>
      <div className="px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Latest Loads
        </h2>
        <div className="bg-white shadow-md rounded-xl p-4">
          <LoadTable />
        </div>
      </div>
      {/* <div className="px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 mt-2">
        <CardRevenueSummary />
        <CardPerformance />
      </div> */}


      <div className="px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <BidPriceTrendChart data={bidPriceData} />
        <BidStatusBarChart data={bidStatusData} />
        <div className="px-6">
          <div className="mb-4">
                <StatCard
          title="Customer & Expenses"
          primaryIcon={<Package className="text-blue-600 w-6 h-6" />}
          dateRange=""
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
          </div>
      
        <StatCard
          title="Sales & Discount"
          primaryIcon={<Tag className="text-blue-600 w-6 h-6" />}
          dateRange=""
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
      </div>
    </>
  );
};

export default Dashboard;
