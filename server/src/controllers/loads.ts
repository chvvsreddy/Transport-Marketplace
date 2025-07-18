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
