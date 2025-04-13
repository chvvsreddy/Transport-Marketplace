import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const allUsers = await prisma.users.findMany({});
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

export const updatePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedPassword = await prisma.users.update({
      where: { email: emailId },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: "Password updated successfully", updatedPassword });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Error updating password" });
  }
};
