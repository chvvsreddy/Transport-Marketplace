import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllLoads = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allLoads = await prisma.loads.findMany({});
    res.json(allLoads);
  } catch (error) {
    res.status(500).json({ message: "Error in receiving All Loads" });
  }
};

export const getLoadsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shipperId } = req.body;
    const gettedLoads = await prisma.loads.findMany({
      where: {
        shipper: {
          id: shipperId,
        },
      },
    });
    res.status(200).json(gettedLoads);
  } catch (error) {
    console.log(error);
  }
};
