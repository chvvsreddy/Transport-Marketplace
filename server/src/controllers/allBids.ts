import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllBids = async (req: Request, res: Response) => {
  try {
    const allBids = await prisma.bid.findMany();
    res.status(200).json(allBids);
  } catch (error) {
    res.json({ message: "failed getting bids" });
  }
};
