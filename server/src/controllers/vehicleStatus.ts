import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const updateVehicle = async (req: Request, res: Response) => {
  const { registrationNumber, newTrip } = req.body;
  console.log(
    "Updating vehicle with registrationNumber:",
    registrationNumber,
    "and new Trip is :",
    newTrip
  );

  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: {
        registrationNumber,
      },
      data: {
        isActive: true,
        trips: {
          connect: {
            id: newTrip.id,
          },
        },
      },
      include: {
        trips: true,
      },
    });

    res.json(updatedVehicle);
  } catch (error) {
    console.error("Vehicle update error:", error);
    res.status(500).json({
      message: "Vehicle not found or failed to connect trip",
      error,
      newTrip,
      registrationNumber,
    });
  }
};
