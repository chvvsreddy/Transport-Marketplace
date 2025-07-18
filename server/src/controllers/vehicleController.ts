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
    driverName,
    driverImage,
    contact1,
    contact2,
    driverLicense,
    driverRC,
    driverPAN,
  } = req.body;

  console.log(req.body);

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
        driverName,
        driverImage,
        contact1,
        contact2,
        driverLicense,
        driverPAN,
        driverRC,
        insuranceNumber,
        insuranceExpiry: new Date(insuranceExpiry),
        fitnessCertExpiry: new Date(fitnessCertExpiry),
        permitType,
      },
    });

    const user = await prisma.users.findUnique({
      where: { id: ownerId },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid userId: user does not exist" });
      return;
    }
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create vehicle" });
  }
};

export const getActiveVehiclesById = async (req: Request, res: Response) => {
  const { ownerId } = req.body;

  if (!ownerId) {
    res.status(400).json({ error: "ownerId is required" });
    return;
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

export const getAllVehiclesById = async (req: Request, res: Response) => {
  const { ownerId } = req.body;

  if (!ownerId) {
    res.status(400).json({ error: "ownerId is required" });
  }

  try {
    const allVehicles = await prisma.vehicle.findMany({
      where: {
        ownerId,
      },
    });

    res.status(200).json(allVehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to get vehicles" });
  }
};

export const getSingleVehicleByOwnerId = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: "ownerId is required" });
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        ownerId: userId,
      },
    });

    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to get vehicles" });
  }
};
