import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createIndividualDriverDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      licenseNumber,
      licenseExpiry,
      licenseFrontUrl,
      licenseBackUrl,
      insuranceNumber,
      insuranceExpiry,
      insuranceDocUrl,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    const createAccount = await prisma.driverDetails.create({
      data: {
        userId,
        licenseNumber,
        licenseExpiry,
        licenseFrontUrl,
        licenseBackUrl,
        insuranceNumber,
        insuranceExpiry,
        insuranceDocUrl,
        emergencyContactName,
        emergencyContactPhone,
      },
    });

    res.json(createAccount);
  } catch (error) {
    res.status(400).json({
      message: "error on updating individual driver details",
    });
  }
};

export const getIndividualDriverDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const response = await prisma.driverDetails.findUnique({
      where: {
        userId,
      },
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      message: "error on getting individual driver details",
    });
  }
};
