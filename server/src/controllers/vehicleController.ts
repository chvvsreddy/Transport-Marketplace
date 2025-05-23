import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createVehicle = async (req: Request, res: Response) => {
  const {
    registrationNumber,
    make,
    model,
    year,
    capacity,
    dimensions,
    vehicleType,
    ownerId,
    insuranceNumber,
    insuranceExpiry,
    fitnessCertExpiry,
    permitType,
  } = req.body;

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        make,
        model,
        year: Number(year),
        capacity: Number(capacity),
        dimensions,
        vehicleType,

        ownerId: ownerId,

        insuranceNumber,
        insuranceExpiry: new Date(insuranceExpiry),
        fitnessCertExpiry: new Date(fitnessCertExpiry),
        permitType,
      },
    });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create vehicle" });
  }
};

export const getAllVehiclesById = async (req: Request, res: Response) => {
  const { ownerId } = req.body;

  if (!ownerId) {
    res.status(400).json({ error: "ownerId is required" });
  }

  try {
    const allVehicles = await prisma.vehicle.findMany({
      where: {
        ownerId,
        isActive: false,
      },
    });

    res.status(200).json(allVehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to get vehicles" });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  const { registrationNumber ,newTrip} = req.body;
  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: {
        registrationNumber: registrationNumber,
      },
      data: {
        isActive: true,
        trips:newTrip
      },
    });
    res.json(updatedVehicle);
  } catch (error) {
    res.status(404).json({ message: "vehicle not found for updating status" });
  }
};
