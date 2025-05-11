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
  const { userId, loadId, price, negotiateDriverPrice } = req.body;
  try {
    const createdBid = await prisma.bid.create({
      data: {
        carrierId: userId,
        loadId,
        price,
        estimatedDuration: 0,
        negotiateDriverPrice,
      },
    });
    res.status(200).json(createdBid);
  } catch (e) {
    res.json({ message: "error on creating bid" });
  }
};

export const updateBid = async (req: Request, res: Response) => {
  const { bidId, shipperId, price } = req.body;
  try {
    const findUser = await prisma.users.findUnique({
      where: {
        id: shipperId,
      },
    });
    if (
      findUser?.type == "INDIVIDUAL_SHIPPER" ||
      findUser?.type == "SHIPPER_COMPANY"
    ) {
      try {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            negotiateShipperPrice: price,
          },
        });

        res.status(200).json(updatedBidAmount);
      } catch (error) {
        res.json({ message: "error on updating bid from shippers" });
      }
    } else if (findUser?.type == "INDIVIDUAL_DRIVER") {
      try {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            negotiateDriverPrice: price,
          },
        });

        res.status(200).json(updatedBidAmount);
      } catch (error) {
        res.json({ message: "error on updating bid from drivers" });
      }
    }
  } catch (e) {
    res.json({ message: "error on updating bid via socket" });
  }
};
export const updateBidStatus = async (req: Request, res: Response) => {
  const { bidId, shipperId } = req.body;
  try {
    const findUser = await prisma.users.findUnique({
      where: {
        id: shipperId,
      },
    });
    if (
      findUser?.type == "INDIVIDUAL_SHIPPER" ||
      findUser?.type == "SHIPPER_COMPANY"
    ) {
      try {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            isShipperAccepted: true,
          },
        });

        res.status(200).json(updatedBidAmount);
      } catch (error) {
        res.json({ message: "error on updating bid from shippers" });
      }
    } else if (findUser?.type == "INDIVIDUAL_DRIVER") {
      try {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            isDriverAccepted: true,
          },
        });

        res.status(200).json(updatedBidAmount);
      } catch (error) {
        res.json({ message: "error on updating bid status from drivers" });
      }
    }
  } catch (e) {
    res.json({ message: "error on updating bid status via socket" });
  }
};
