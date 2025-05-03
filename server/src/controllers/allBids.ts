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

export const createBid = async (req: Request, res: Response) => {
  const { userId, loadId, price } = req.body;
  try {
    const createdBid = await prisma.bid.create({
      data: {
        carrierId: userId,
        loadId,
        price,
        estimatedDuration: 0,
      },
    });
    res.status(200).json(createdBid);
  } catch (e) {
    res.json({ message: "error on creating bid" });
  }
};
