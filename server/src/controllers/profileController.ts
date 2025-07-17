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

export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, profilePic } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // if (email && typeof email !== "string") {
    //   res.status(400).json({ message: "Invalid email format" });
    //   return;
    // }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        profilePic,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
