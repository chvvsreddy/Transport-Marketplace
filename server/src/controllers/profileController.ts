import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const gettedUserDetails = await prisma.users.findUnique({
      where: {
        id: String(userId),
      },
    });

    if (!gettedUserDetails) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(gettedUserDetails);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
