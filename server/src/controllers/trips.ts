import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getBidsByLoadId = async (req: Request, res: Response) => {
  const { loadId } = req.body;
  try {
    const gotBids = await prisma.bid.findMany({
      where: {
        loadId,
      },
    });
    res.status(201).json(gotBids);
  } catch (error) {
    console.log(error);
    res.json({
      message: "error on getting bids",
    });
  }
};

export const getTripsByLoadId = async (req: Request, res: Response) => {
  const { loadId } = req.body;
  try {
    const gotBids = await prisma.trips.findMany({
      where: {
        loadId,
      },
    });
    res.status(201).json(gotBids);
  } catch (error) {
    console.log(error);
    res.json({
      message: "error on getting trips",
    });
  }
};

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
    const createdTrip = await prisma.trips.create({
      data: {
        driverId,
        loadId,
        plannedRoute,
        vehicleId,
        estimatedDuration,
        distance,
      },
    });
    res.json(createdTrip);
  } catch (error) {
    res.json({ message: "error on creating trip" });
  }
};
