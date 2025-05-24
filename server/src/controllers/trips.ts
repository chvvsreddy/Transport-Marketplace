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


