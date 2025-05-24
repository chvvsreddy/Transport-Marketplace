import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateDriverLocation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { coordinates, driverUserId } = req.body;
  try {
    const updatedDriverLoaction = await prisma.driverDetails.update({
      where: {
        userId: driverUserId,
      },
      data: {
        currentLocation: coordinates,
      },
    });

    res.status(200).json(updatedDriverLoaction);
  } catch (error) {
    res.json({ message: "error on updating driver location" });
  }
};
export const getBidsByCarrierId = async (req: Request, res: Response) => {
  const { carrierId } = req.body;

  try {
    const bids = await prisma.bid.findMany({
      where: {
        carrierId,
        status: "ACCEPTED",
      },
    });

    if (bids.length > 0) {
      const loads = await Promise.all(
        bids.map(async (bid) => {
          const load = await prisma.loads.findUnique({
            where: {
              id: bid.loadId,
            },
          });
          return load;
        })
      );

      res.status(200).json(loads.filter(Boolean));
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Bids not found" });
  }
};
export const getBidsByCarrierIdForTripsAssigning = async (
  req: Request,
  res: Response
) => {
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
            where: {
              id: carrierId,
            },
          }),
        ]);

        const findLoadInTrips = await prisma.trips.findUnique({
          where: {
            loadId: load?.id,
          },
        });

        if (findLoadInTrips === null) {
          return load ? { load, bid, user } : null;
        }
      })
    );

    const filteredResults = results.filter(Boolean);

    res.status(200).json(filteredResults);
  } catch (error) {
    console.error("Error fetching bids for trip assignment:", error);
    res.status(500).json({ message: "Error retrieving bids" });
  }
};
