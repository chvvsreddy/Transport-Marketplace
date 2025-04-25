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
