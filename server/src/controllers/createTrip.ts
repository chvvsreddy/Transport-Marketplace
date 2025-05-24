import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createTrip = async (req: Request, res: Response) => {
  const {
    loadId,
    driverId,
    plannedRoute,
    vehicleId,
    estimatedDuration,
    distance,
  } = req.body;

  try {
    // Check if trip already exists for this load
    const existingTrip = await prisma.trips.findUnique({
      where: { loadId },
    });

    if (existingTrip) {
       res
        .status(409)
        .json({ message: "Trip already exists for this load" });
    }

    const createdTrip = await prisma.trips.create({
      data: {
        loadId,
        driverId,
        vehicleId,
        plannedRoute,
        estimatedDuration,
        distance,
        status: "SCHEDULED",
      },
    });

    res.status(201).json(createdTrip);
  } catch (error) {
    console.error("Trip creation error:", error);
    res.status(500).json({ message: "Error on creating trip", error });
  }
};
