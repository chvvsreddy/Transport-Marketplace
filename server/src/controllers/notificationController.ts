import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getNotificationsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const getNotifics = await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(getNotifics);
  } catch (error) {
    res.status(400).json({
      message: "error on getting notifications by userId",
    });
  }
};
