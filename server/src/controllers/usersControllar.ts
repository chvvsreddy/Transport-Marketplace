import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allUsers = await prisma.users.findMany({
      take: 15,
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Error in receiving All Users" });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userObj = req.body;

    if (!userObj.passwordHash) {
      res.status(400).json({ message: "Password is required" });
    }

    const hashedPassword = await bcrypt.hash(userObj.passwordHash, 10);

    userObj.passwordHash = hashedPassword;

    const createdUser = await prisma.users.create({
      data: userObj,
    });

    res.status(201).json(createdUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};
