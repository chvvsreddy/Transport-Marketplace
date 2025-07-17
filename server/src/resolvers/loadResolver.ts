import { PrismaClient } from "@prisma/client";
import {
  parse,
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
      {
        input,
      }: { input: { startDate?: string; endDate?: string; userId: string } }
    ) => {
      const { startDate, endDate, userId } = input;

      // Default to earliest and latest dates if not provided
      let parsedStart = startDate
        ? parse(startDate, "dd-MM-yyyy", new Date())
        : new Date("2000-01-01"); // far past

      let parsedEnd = endDate
        ? parse(endDate, "dd-MM-yyyy", new Date())
        : new Date(); // today

      if (!isValid(parsedStart)) parsedStart = new Date("2000-01-01");
      if (!isValid(parsedEnd)) parsedEnd = new Date();

      console.log("startDate", startDate);
      console.log("enddate", endDate);
      console.log("parsedStart", parsedStart);
      console.log("paresedemd", parsedEnd);

      const fromDate = startOfDay(parsedStart);
      const toDate = startOfDay(new Date(parsedEnd.getTime() + 86400000));

      const days = eachDayOfInterval({ start: fromDate, end: parsedEnd });

      // === Load Stats ===
      const totalLoads = await prisma.loads.count({
        where: {
          shipperId: userId,
          createdAt: { gte: fromDate, lt: toDate },
        },
      });

      const countOfCompleted = await prisma.loads.count({
        where: {
          shipperId: userId,
          status: "DELIVERED",
          createdAt: { gte: fromDate, lt: toDate },
        },
      });

      const countOfIntransit = await prisma.loads.count({
        where: {
          shipperId: userId,
          status: "IN_TRANSIT",
          createdAt: { gte: fromDate, lt: toDate },
        },
      });

      // === Payments ===
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: { gte: fromDate, lt: toDate },
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

      // === Bids ===
      const userLoadIds = (
        await prisma.loads.findMany({
          where: { shipperId: userId },
          select: { id: true },
        })
      ).map((load) => load.id);

      const bids = await prisma.bid.findMany({
        where: {
          loadId: { in: userLoadIds },
          createdAt: { gte: fromDate, lt: toDate },
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
        where: { shipperId: userId },
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

      // === Bid status chart ===
      const allUserLoads = await prisma.loads.findMany({
        where: { shipperId: userId },
        select: { id: true },
      });

      const userLoadIdSet = new Set(allUserLoads.map((load) => load.id));

      const bidsWithLoads = await prisma.bid.findMany({
        where: { createdAt: { gte: fromDate, lt: toDate } },
        select: {
          createdAt: true,
          status: true,
          load: { select: { id: true, status: true } },
        },
      });

      const bidStatusDataMap = new Map<
        string,
        { accepted: number; rejected: number }
      >();

      bidsWithLoads.forEach((bid) => {
        if (!bid.load || !userLoadIdSet.has(bid.load.id)) return;

        const loadStatus = bid.load.status;
        if (!["ASSIGNED", "IN_TRANSIT", "DELIVERED"].includes(loadStatus))
          return;

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

      const bidStatusData = Array.from(bidStatusDataMap.entries())
        .map(([date, { accepted, rejected }]) => ({ date, accepted, rejected }))
        .filter((entry) => entry.accepted > 0 || entry.rejected > 0);

      // === Top 5 Payments ===
      const top5Payments = await prisma.payment.findMany({
        where: { createdAt: { gte: fromDate, lt: toDate } },
        orderBy: { amount: "desc" },
        take: 5,
        select: { amount: true, createdAt: true },
      });

      const top5HighestPayments = top5Payments.map((p) => ({
        date: format(p.createdAt, "MMM d"),
        price: p.amount,
      }));

      // === Top 5 Highest Bids ===
      const top5Bids = await prisma.bid.findMany({
        where: { createdAt: { gte: fromDate, lt: toDate } },
        orderBy: { price: "desc" },
        select: { price: true, createdAt: true, loadId: true },
      });

      const top5HighestBids = top5Bids
        .filter((bid) => userLoadIdSet.has(bid.loadId))
        .slice(0, 5)
        .map((bid) => ({
          date: format(bid.createdAt, "MMM d"),
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
        top5HighestPayments,
        top5HighestBids,
      };
    },
  },
};
