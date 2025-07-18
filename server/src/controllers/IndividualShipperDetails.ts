import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createIndividualShipperDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      address,
      city,
      state,
      country,
      postalCode,
      aadhaarNumber,
      panNumber,
      aadhaarUrl,
      panUrl,
    } = req.body;

    const createAccount = await prisma.individualShipperDetails.create({
      data: {
        userId,
        address,
        city,
        state,
        country,
        postalCode,
        aadhaarNumber,
        panNumber,
        aadhaarUrl,
        panUrl,
      },
    });

    res.json(createAccount);
  } catch (error) {
    res.status(400).json({
      message: "error on updating individual shipper details",
    });
  }
};

export const getIndividualShipperDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const response = await prisma.individualShipperDetails.findUnique({
      where: {
        userId,
      },
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      message: "error on getting individual shipper details",
    });
  }
};
