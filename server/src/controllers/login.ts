import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const checkUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
    }

    const checkedUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!checkedUser) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      checkedUser.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    return res.status(200).json({
      message: "Login successful!",
      userId: checkedUser.id,
      type: checkedUser.type,
      email: checkedUser.email,
      phone:checkedUser.phone
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      return res
        .status(500)
        .json({ message: `Internal server error: ${error.message}` });
    }
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};
