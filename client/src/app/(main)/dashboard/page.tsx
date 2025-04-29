"use client";
import React, { useEffect, useState } from "react";
import { Package, Tag, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useUser } from "@/app/util/UserContext";
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
        {/* other StatCards... */}
      </div>
    </>
  );
};

export default Dashboard;
