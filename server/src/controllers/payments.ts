import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getLoadBidTripPaymentByUserIdFilter = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.body;

  try {
    const loads = await prisma.loads.findMany({
      where: {
        shipperId: userId,
      },
    });

    const result = await Promise.all(
      loads.map(async (load) => {
        const bid = await prisma.bid.findFirst({
          where: { loadId: load.id },
        });

        const trip = await prisma.trips.findFirst({
          where: { loadId: load.id },
          include: { payments: true },
        });

        return {
          load,
          bid,
          trip,
          payments: trip?.payments || [],
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getLoadBidTripPaymentByUserId:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
