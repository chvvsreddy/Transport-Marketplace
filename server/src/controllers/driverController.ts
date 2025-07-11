import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateDriverLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { coordinates, driverUserId } = req.body;

  try {
    const updatedDriverLocation = await prisma.driverDetails.update({
      where: { userId: driverUserId },
      data: { currentLocation: coordinates },
    });

    res.status(200).json(updatedDriverLocation);
  } catch (error) {
    console.error("Error updating driver location:", error);
    res.status(500).json({ message: "Error updating driver location" });
  }
};

export const getBidsByCarrierId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { carrierId } = req.body;

  try {
    const bids = await prisma.bid.findMany({
      where: { carrierId, status: "ACCEPTED" },
    });

    if (!bids.length) {
      res.status(200).json([]);
      return;
    }

    const loads = await Promise.all(
      bids.map(async (bid) => {
        const load = await prisma.loads.findUnique({
          where: { id: bid.loadId },
        });
        return load ?? null;
      })
    );

    res.status(200).json(loads.filter(Boolean));
  } catch (error) {
    console.error("Error getting bids by carrier ID:", error);
    res.status(500).json({ message: "Bids not found" });
  }
};

export const getBidsByCarrierIdForTripsAssigning = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { carrierId } = req.params;

  try {
    const bids = await prisma.bid.findMany({
      where: {
        carrierId,
        status: "ACCEPTED",
        isDriverAccepted: true,
        isShipperAccepted: true,
      },
    });

    if (bids.length === 0) {
      res.status(200).json([]);
      return;
    }

    const results = await Promise.all(
      bids.map(async (bid) => {
        const [load, user] = await Promise.all([
          prisma.loads.findFirst({
            where: {
              id: bid.loadId,
              status: "ASSIGNED",
            },
          }),
          prisma.users.findUnique({
            where: { id: carrierId },
          }),
        ]);

        if (!load) return null;

        const findLoadInTrips = await prisma.trips.findUnique({
          where: { loadId: load.id },
        });

        if (!findLoadInTrips) {
          return { load, bid, user };
        }

        return null;
      })
    );

    const filteredResults = results.filter(Boolean);
    res.status(200).json(filteredResults);
  } catch (error) {
    console.error("Error fetching bids for trip assignment:", error);
    res.status(500).json({ message: "Error retrieving bids" });
  }
};
