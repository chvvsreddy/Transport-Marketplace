import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";
import { PrismaClient } from "@prisma/client";

// Route Imports
import allLoadsRoute from "./routes/allLoadsRoutes";
import allUsersRoute from "./routes/allUsersRoutes";
import loginRoutes from "./routes/loginRoutes";
import profileRoutes from "./routes/profileRoutes";
import signupRoutes from "./routes/signupRoutes";
import loadsRoutes from "./routes/loadsRoutes";
import adminLoadRoutes from "./routes/adminLoads";
import postLoadRoutes from "./routes/postLoadRoutes";
import driverRoutes from "./routes/driverRoutes";
import allBidsRoutes from "./routes/allBidsRoutes";

// Configurations
dotenv.config();
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const onlineUsers = new Map();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use("/allLoads", allLoadsRoute);
app.use("/allUsers", allUsersRoute);
app.use("/login", loginRoutes);
app.use("/profile", profileRoutes);
app.use("/register", signupRoutes);
app.use("/myloads", loadsRoutes);
app.use("/loadmanagement", adminLoadRoutes);
app.use("/postload", postLoadRoutes);
app.use("/driverLocation", driverRoutes);
app.use("/bids&orders", allBidsRoutes);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket Event Handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Registering user with their socket ID
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(
      `Registered user: ${userId} | Active clients: ${io.engine.clientsCount}`
    );
  });

  socket.on("updateBidAmount", async ({ bidId, shipperId, price, toUser }) => {
    try {
      const receiverSocketId = onlineUsers.get(shipperId);

      const findUser: any = await prisma.users.findUnique({
        where: { id: shipperId },
      });
      console.log("event triggered");
      if (!receiverSocketId) return;

      const isShipper = ["INDIVIDUAL_SHIPPER", "SHIPPER_COMPANY"].includes(
        findUser?.type
      );
      const priceField = isShipper
        ? "negotiateShipperPrice"
        : "negotiateDriverPrice";

      const updatedBidAmount = await prisma.bid.update({
        where: { id: bidId },
        data: { [priceField]: price },
      });
      // console.log(`socket id :${receiverSocketId} for this user ${toUser}`);
    } catch (error) {
      console.error("Error updating bid amount:", error);
    }
  });

  // Updating bid status
  socket.on("updateBidStatus", async ({ bidId, shipperId, toUser }) => {
    try {
      const receiverSocketId = onlineUsers.get(toUser);

      const findUser = await prisma.users.findUnique({
        where: { id: shipperId },
      });

      if (!receiverSocketId) return;

      const isShipper = findUser?.type === "SHIPPER_COMPANY";
      const statusField = isShipper ? "isShipperAccepted" : "isDriverAccepted";

      const updatedBidStatus = await prisma.bid.update({
        where: { id: bidId },
        data: { [statusField]: true },
      });
    } catch (error) {
      console.error("Error updating bid status:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (const [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// Server Setup
const port = Number(process.env.PORT) || 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
