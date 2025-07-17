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

export const getTripByLoadId = async (req: Request, res: Response) => {
  try {
    const { loadId } = req.params;

    if (!loadId) {
      res.status(400).json({ error: "loadId is required" });
      return;
    }

    const trip = await prisma.trips.findFirst({
      where: { loadId },
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found for this load" });
      return;
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip by loadId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
