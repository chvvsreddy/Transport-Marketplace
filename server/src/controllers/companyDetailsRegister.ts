import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createCompanyDetails = async (req: Request, res: Response) => {
  const {
    userId,
    companyName,
    legalName,
    address,
    city,
    state,
    country,
    postalCode,
    cin,
    gstNumber,
    panNumber,
  } = req.body;
  try {
    const created = await prisma.companyDetails.create({
      data: {
        userId,
        companyName,
        legalName,
        address,
        city,
        state,
        country,
        postalCode,
        cin,
        gstNumber,
        panNumber,
      },
    });

    res.status(200).json(created);
  } catch (error) {
    res.status(400).json({
      message: "error on updating user company details",
    });
  }
};

export const getUserCompanyDetails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const response = await prisma.companyDetails.findUnique({
      where: {
        userId,
      },
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({
      message: "error on getting company details",
    });
  }
};
