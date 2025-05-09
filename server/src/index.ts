import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";

// ROUTE IMPORTS
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
import { PrismaClient } from "@prisma/client";

// CONFIGURATIONS
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/allLoads", allLoadsRoute); // http://localhost:8000/allLoads
app.use("/allUsers", allUsersRoute);
app.use("/login", loginRoutes);
app.use("/profile", profileRoutes);
app.use("/Register", signupRoutes);
app.use("/myloads", loadsRoutes);
app.use("/loadmanagement", adminLoadRoutes);
app.use("/postload", postLoadRoutes);
app.use("/driverLocation", driverRoutes);
app.use("/bids&orders", allBidsRoutes);
/* SERVER */

const onlineUsers = new Map();
const prisma = new PrismaClient();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("Registered user :", userId);
    console.log("No of clients in live :" + io.engine.clientsCount);
  });

  socket.on("updateBidAmount", async ({ bidId, shipperId, price }) => {
    const receiverSocketId = onlineUsers.get(shipperId);
    const findUser = await prisma.users.findUnique({
      where: {
        id: shipperId,
      },
    });

    if (receiverSocketId) {
      if (
        findUser?.type == "INDIVIDUAL_SHIPPER" ||
        findUser?.type == "SHIPPER_COMPANY"
      ) {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            negotiateShipperPrice: price,
          },
        });

        io.to(receiverSocketId).emit(
          "receiveUpdatedBidPrice",
          updatedBidAmount
        );
      } else if (findUser?.type == "INDIVIDUAL_DRIVER") {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            negotiateDriverPrice: price,
          },
        });

        io.to(receiverSocketId).emit(
          "receiveUpdatedBidPrice",
          updatedBidAmount
        );
      }
    } else {
      if (
        findUser?.type == "INDIVIDUAL_SHIPPER" ||
        findUser?.type == "SHIPPER_COMPANY"
      ) {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            negotiateShipperPrice: price,
          },
        });
        io.emit("receiveUpdatedBidPrice", updatedBidAmount);
      } else if (findUser?.type == "INDIVIDUAL_DRIVER") {
        const updatedBidAmount = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            negotiateDriverPrice: price,
          },
        });
        io.emit("receiveUpdatedBidPrice", updatedBidAmount);
      }
    }

    socket.on("disconnect", () => {
      console.log("client disconnected:", socket.id);

      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
});

const port = Number(process.env.PORT) || 8000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
