import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createLoad = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    shipperId,
    origin,
    destination,
    weight,
    dimensions,
    cargoType,
    specialRequirements,
    price,
    bidPrice,
    noOfTrucks,
    pickupWindowStart,
    pickupWindowEnd,
    deliveryWindowStart,
    deliveryWindowEnd,
  } = req.body;

  try {
    const load = await prisma.loads.create({
      data: {
        shipperId,
        origin,
        destination,
        weight: parseFloat(weight),
        dimensions,
        cargoType,
        specialRequirements,
        price: parseFloat(price),
        bidPrice: parseFloat(bidPrice),
        noOfTrucks: parseInt(noOfTrucks),
        pickupWindowStart: new Date(pickupWindowStart),
        pickupWindowEnd: new Date(pickupWindowEnd),
        deliveryWindowStart: new Date(deliveryWindowStart),
        deliveryWindowEnd: new Date(deliveryWindowEnd),
      },
    });

    res.status(201).json(load);
  } catch (error) {
    console.error("Error creating load:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
