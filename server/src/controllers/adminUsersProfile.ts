import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { userId, isVerified } = req.body;

    const updatedProfile = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        isVerified,
      },
    });
    res.status(201).json(updatedProfile);
  } catch (error) {
    res.json({ message: "update failed in admin" });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId, isDriverVerified } = req.body;

    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        isDriverVerified,
        isVehicleVerified: isDriverVerified === true ? true : false,
      },
    });
    res.status(201).json(updatedVehicle);
  } catch (error) {
    res.json({ message: "update failed on vehicle by admin" });
  }
};
