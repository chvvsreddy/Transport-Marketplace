"use client";
import React, { useLayoutEffect, useState } from "react";
import { Package, Tag, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useUser } from "@/app/util/UserContext";
import { Button } from "antd";
import LoadTable from "./LoadsDash";
import { format, parse } from "date-fns";
import MonthlyLoadsChart from "./components/MontlyLoads";
import BidPriceTrendChart from "./components/BidPriceTrend";
import BidStatusBarChart from "./components/BidStatusBarChart";
import { getLoggedUserFromLS } from "@/app/util/getLoggedUserFromLS";
import RevenueTrendChart from "./components/RevenueTrends";

const Heading = dynamic(() => import("@/app/util/Heading/index"), {
  loading: () => <h2>Loading Heading...</h2>,
});
const StatCard = dynamic(() => import("./StatCard"), {
  loading: () => <p>Loading Stat Card...</p>,
});

type DashboardData = {
  totalLoads: number;
  countOfCompleted: number;
  countOfIntransit: number;
  totalRevenue: number;
  totalRevenuePending: number;
  totalRevenueCompleted: number;
  top5LoadDays: { date: string; count: number }[];
  top5HighestBids: { date: string; price: number }[];
  latestThreeLoads: {
    id: string;
    origin: { city?: string };
    destination: { city?: string };
    cargoType: string;
    status: string;
    price: number;
    pickupWindow: string;
  }[];
  bidStatusData: {
    date: string;
    accepted: number;
    rejected: number;
  }[];
  top5HighestPayments: { date: string; price: number }[];
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return format(new Date(), "dd-MM-yyyy");
  });

  const [dashboardData, setDashBoardData] = useState<DashboardData | null>(
    null
  );
  const router = useRouter();
  const { setUser } = useUser();
  const query = `
  query GetLoadsCountByDate($input: LoadStatsInput!) {
    getLoadsCountByDate(input: $input) {
      totalLoads
      countOfCompleted
      countOfIntransit
      totalRevenue
    totalRevenuePending
    totalRevenueCompleted
      top5LoadDays {
      date
      count
    }
      latestThreeLoads {
      id
      origin {
        city
       
      }
      destination {
        city
      }
      cargoType
      status
      price
      pickupWindow
    }
       bidStatusData {
      date
      accepted
      rejected
    }
      top5HighestPayments {
      date
      price
    }
      top5HighestBids {
      date
      price
    }
    }
  }
`;
  useLayoutEffect(() => {
    const storedUser = getLoggedUserFromLS();
    if (storedUser.userId != "no user") {
      const userObj = storedUser;
      // setLoggedUser(userObj);
      setUser(userObj);
      if (userObj.type === "INDIVIDUAL_DRIVER") {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }

    async function fetchDashboardData() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: {
              input: {
                startDate: selectedDate,
                userId: getLoggedUserFromLS().userId,
              },
            },
          }),
        });

        const result = await response.json();
        if (result?.data?.getLoadsCountByDate) {
          setDashBoardData(result.data.getLoadsCountByDate);
        } else {
          console.error("GraphQL Error:", result.errors || "Unknown error");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }

    fetchDashboardData();
  }, [selectedDate]);

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

  // const data = {
  //   totalLoads: 120,
  //   completedLoads: 90,
  //   inTransitLoads: 20,
  //   totalRevenue: 250000,
  //   pendingRevenue: 50000,
  // };
  console.log("Selected month : ", selectedDate);
  console.log("dashboard data : ", dashboardData);
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
            id="date"
            type="date"
            // Convert "dd-MM-yyyy" back to "yyyy-MM-dd" for input value
            value={format(
              parse(selectedDate, "dd-MM-yyyy", new Date()),
              "yyyy-MM-dd"
            )}
            onChange={(e) => {
              const inputDate = e.target.value; // e.g., "2025-07-07"
              const formatted = format(new Date(inputDate), "dd-MM-yyyy"); // "07-07-2025"
              setSelectedDate(formatted);
            }}
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
                <h3 className="text-2xl font-bold mt-1">
                  {dashboardData?.totalLoads}
                </h3>
              </div>
              <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                <p className="text-gray-500 text-sm">Completed Loads</p>
                <h3 className="text-2xl font-bold text-green-500 mt-1">
                  {dashboardData?.countOfCompleted}
                </h3>
              </div>
              <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                <p className="text-gray-500 text-sm">In Transit</p>
                <h3 className="text-2xl font-bold text-yellow-500 mt-1">
                  {dashboardData?.countOfIntransit}
                </h3>
              </div>
            </div>
            <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
              <div className="w-full">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Loads Trend
                </h2>
                <MonthlyLoadsChart data={dashboardData?.top5LoadDays || []} />
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
                  ₹{dashboardData?.totalRevenue}
                </h3>
              </div>
              <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                <p className="text-gray-500 text-sm">Fullfilled Revenue</p>
                <h3 className="text-2xl font-bold text-green-500 mt-1">
                  ₹{dashboardData?.totalRevenueCompleted}
                </h3>
              </div>
              <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
                <p className="text-gray-500 text-sm">Pending Revenue</p>
                <h3 className="text-2xl font-bold text-red-500 mt-1">
                  ₹{dashboardData?.totalRevenuePending}
                </h3>
              </div>
            </div>
            <div className="bg-white rounded shadow-md p-5 flex flex-col items-start">
              <div className="w-full">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  Revenue Trend
                </h2>
                <RevenueTrendChart
                  data={dashboardData?.top5HighestPayments || []}
                />
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
          <LoadTable LoadsData={dashboardData?.latestThreeLoads || []} />
        </div>
      </div>
      {/* <div className="px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 mt-2">
        <CardRevenueSummary />
        <CardPerformance />
      </div> */}

      <div className="px-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <BidPriceTrendChart data={dashboardData?.top5HighestBids || []} />
        <BidStatusBarChart data={dashboardData?.bidStatusData || []} />
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
