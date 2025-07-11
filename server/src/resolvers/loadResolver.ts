import { PrismaClient } from "@prisma/client";
import {
  parse,
  subDays,
  startOfDay,
  isValid,
  format,
  eachDayOfInterval,
} from "date-fns";

const prisma = new PrismaClient();

export const loadResolvers = {
  Load: {
    origin: (parent: any) => parent.origin,
    destination: (parent: any) => parent.destination,
    pickupWindow: (parent: any) => {
      const start = new Date(parent.pickupWindowStart);
      const end = new Date(parent.pickupWindowEnd);
      return `${format(start, "d MMM")} - ${format(end, "d MMM")}`;
    },
  },
  Query: {
    getLoadsCountByDate: async (
      _: unknown,
      { input }: { input: { startDate: string; userId: string } }
    ) => {
      const { startDate, userId } = input;
      let parsedStart = parse(input.startDate, "dd-MM-yyyy", new Date());

      if (!isValid(parsedStart)) {
        console.warn("Invalid startDate format, using current date");
        parsedStart = new Date();
      }
      const today = startOfDay(parsedStart);
      const end = startOfDay(new Date(today.getTime() + 86400000)); // include full today
      const fromDate = startOfDay(subDays(today, 30));
      const days = eachDayOfInterval({ start: fromDate, end: today });

      // === Load Stats ===
      const totalLoads = await prisma.loads.count({
        where: {
          shipperId: userId,
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
      });

      const countOfCompleted = await prisma.loads.count({
        where: {
          shipperId: userId,
          status: "DELIVERED",
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
      });

      const countOfIntransit = await prisma.loads.count({
        where: {
          shipperId: userId,
          status: "IN_TRANSIT",
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
      });

      // === Payment Stats === && (PENDING)
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
        select: {
          amount: true,
          status: true,
          createdAt: true,
        },
      });

      let totalRevenue = 0;
      let totalRevenuePending = 0;
      let totalRevenueCompleted = 0;

      for (const payment of payments) {
        totalRevenue += payment.amount;
        if (payment.status === "PENDING") {
          totalRevenuePending += payment.amount;
        } else if (payment.status === "COMPLETED") {
          totalRevenueCompleted += payment.amount;
        }
      }

      // === Top 5 Load Days ===
      const loadCountsPerDay = await Promise.all(
        days.map(async (day) => {
          const count = await prisma.loads.count({
            where: {
              shipperId: userId,
              createdAt: {
                gte: startOfDay(day),
                lt: startOfDay(new Date(day.getTime() + 86400000)),
              },
            },
          });

          return {
            date: format(day, "MMM d"),
            count,
          };
        })
      );

      const top5LoadDays = loadCountsPerDay
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // === Top 5 Bid Days (filtered by shipper's loads) === (completed)
      const loads = await prisma.loads.findMany({
        where: {
          shipperId: userId,
        },
        select: {
          id: true,
        },
      });

      const loadIds = loads.map((load) => load.id);

      const bids = await prisma.bid.findMany({
        where: {
          loadId: { in: loadIds },
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
        select: {
          price: true,
          createdAt: true,
        },
      });

      const bidPricesPerDay = days.map((day) => {
        const dayStart = startOfDay(day).getTime();
        const nextDay = startOfDay(
          new Date(day.getTime() + 86400000)
        ).getTime();

        const pricesOnDay = bids
          .filter((b) => {
            const t = new Date(b.createdAt).getTime();
            return t >= dayStart && t < nextDay;
          })
          .map((b) => b.price);

        const maxPrice = pricesOnDay.length ? Math.max(...pricesOnDay) : 0;

        return {
          date: format(day, "MMM d"),
          price: maxPrice,
        };
      });

      const top5BidDays = bidPricesPerDay
        .filter((entry) => entry.price > 0)
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);

      // === Latest 3 Loads ===
      const latestThreeLoads = await prisma.loads.findMany({
        where: {
          shipperId: userId,
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          origin: true,
          destination: true,
          cargoType: true,
          status: true,
          price: true,
          pickupWindowStart: true,
          pickupWindowEnd: true,
        },
      });

      // Step 1: Get all load IDs for the user(completed)
      const loadsForUser = await prisma.loads.findMany({
        where: {
          shipperId: userId,
        },
        select: {
          id: true,
        },
      });

      const userLoadIds = new Set(loadsForUser.map((load) => load.id));

      // Step 2: Get all bids with their associated loads in the time range
      const bidsWithLoads = await prisma.bid.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
        select: {
          createdAt: true,
          status: true,
          load: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      });

      // Step 3: Filter bids where the load belongs to this user
      const filteredBids = bidsWithLoads.filter(
        (bid) => bid.load && userLoadIds.has(bid.load.id)
      );

      // Step 4: Group and count by date
      const bidStatusDataMap = new Map<
        string,
        { accepted: number; rejected: number }
      >();

      filteredBids.forEach((bid) => {
        const loadStatus = bid.load?.status;
        const validLoadStatus = ["ASSIGNED", "IN_TRANSIT", "DELIVERED"];
        if (!validLoadStatus.includes(loadStatus)) return;

        const dateKey = format(new Date(bid.createdAt), "MMM d");

        if (!bidStatusDataMap.has(dateKey)) {
          bidStatusDataMap.set(dateKey, { accepted: 0, rejected: 0 });
        }

        const statusEntry = bidStatusDataMap.get(dateKey)!;

        if (bid.status === "ACCEPTED") {
          statusEntry.accepted += 1;
        } else if (["PENDING", "REJECTED"].includes(bid.status)) {
          statusEntry.rejected += 1;
        }
      });

      // Step 5: Final array for chart or return
      const bidStatusData = Array.from(bidStatusDataMap.entries())
        .map(([date, { accepted, rejected }]) => ({ date, accepted, rejected }))
        .filter((entry) => entry.accepted > 0 || entry.rejected > 0);

      //payments(Not completed)

      const top5Payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
        orderBy: {
          amount: "desc",
        },
        take: 5,
        select: {
          amount: true,
          createdAt: true,
        },
      });

      const formatted = top5Payments.map((p) => ({
        date: format(p.createdAt, "MMM d"),
        price: p.amount,
      }));

      // top 5 bid price

      // Step 1: Get all load IDs for the user(Completed)
      const loadsAll = await prisma.loads.findMany({
        where: {
          shipperId: userId,
        },
        select: {
          id: true,
        },
      });

      const userLoadIdsCheck = new Set(loadsAll.map((load) => load.id));

      // Step 2: Get top 5 highest bids in the time range
      const top5Bids = await prisma.bid.findMany({
        where: {
          createdAt: {
            gte: fromDate,
            lt: end,
          },
        },
        orderBy: {
          price: "desc",
        },
        select: {
          price: true,
          createdAt: true,
          loadId: true,
        },
      });

      // Step 3: Filter bids for the user's loads only
      const filteredTopBids = top5Bids
        .filter((bid) => userLoadIdsCheck.has(bid.loadId))
        .slice(0, 5);

      // Step 4: Format for frontend
      const top5HighestBids = filteredTopBids.map((bid) => ({
        date: format(bid.createdAt, "MMM d"), // e.g., "Jun 10"
        price: bid.price,
      }));

      return {
        totalLoads,
        countOfCompleted,
        countOfIntransit,
        totalRevenue,
        totalRevenuePending,
        totalRevenueCompleted,
        top5LoadDays,
        top5BidDays,
        latestThreeLoads,
        bidStatusData,
        top5HighestPayments: formatted,
        top5HighestBids,
      };
    },
  },
};
