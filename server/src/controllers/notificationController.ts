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

export const updateNotificationsToRead = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.body;

  try {
    const updatedNotif = await prisma.notification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
    res.status(200).json(updatedNotif);
  } catch (error) {
    const err = new Error("error on updating notification");
    res.status(400).json(err);
  }
};
