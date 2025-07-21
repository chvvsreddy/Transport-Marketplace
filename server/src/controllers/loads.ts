import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLoadByLoadId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const loadId = req.params.loadId;

    if (!loadId) {
      res.status(400).json({ error: "Load ID is required" });
      return;
    }

    const load = await prisma.loads.findUnique({
      where: { id: loadId },
    });

    if (!load) {
      res.status(404).json({ error: "Load not found" });
      return;
    }

    res.status(200).json(load);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateLoadByLoadId = async (req: Request, res: Response) => {
  try {
    const { loadId, status, pickupWindowStart, deliveryWindowEnd } = req.body;

    const updated = await prisma.loads.update({
      where: {
        id: loadId,
      },
      data: {
        status,
        pickupWindowStart,
        deliveryWindowEnd,
      },
    });

    res.status(201).json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteLoadByLoadId = async (req: Request, res: Response) => {
  try {
    const { loadId } = req.body;

    const deleteLoad = await prisma.loads.delete({
      where: {
        id: loadId,
      },
    });

    res.status(201).json({
      message: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
