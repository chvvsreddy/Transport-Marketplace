import { PrismaClient } from "@prisma/client";
import { parse, subDays, startOfDay, isValid } from "date-fns";

const prisma = new PrismaClient();

export const loadResolvers = {
  Query: {
    getLoadsCountByDate: async (
      _: unknown,
      { input }: { input: { startDate: string } }
    ) => {
      let parsedStart = parse(input.startDate, "dd-MM-yyyy", new Date());

      // fallback to today if parse failed
      if (!isValid(parsedStart)) {
        console.warn("Invalid startDate format, using current date");
        parsedStart = new Date();
      }

      const start = startOfDay(parsedStart);         // e.g., 2025-08-01 00:00
      const fromDate = startOfDay(subDays(start, 30)); // 30 days before

      console.log("From:", fromDate.toISOString());
      console.log("To:", start.toISOString());

      const totalLoads = await prisma.loads.count({
        where: {
          createdAt: {
            gte: fromDate,
            lte: start,
          },
        },
      });

      const countOfCompleted = await prisma.loads.count({
        where: {
          status: "DELIVERED",
          createdAt: {
            gte: fromDate,
            lte: start,
          },
        },
      });

      const countOfIntransit = await prisma.loads.count({
        where: {
          status: "IN_TRANSIT",
          createdAt: {
            gte: fromDate,
            lte: start,
          },
        },
      });

      return {
        totalLoads,
        countOfCompleted,
        countOfIntransit,
      };
    },
  },
};
