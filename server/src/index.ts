import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import http from "http";
import { PrismaClient } from "@prisma/client";
import { createYoga } from "graphql-yoga";
import { schema } from "./merge";

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
import vehicleRoutes from "./routes/vehicleRoutes";
import tripRoutes from "./routes/tripRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import createTripRoutes from "./routes/createTripRoutes";
import vehicleStatusUpdate from "./routes/vehicleStatusRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import companyDetailsRoutes from "./routes/companyDetailsRegisterRoutes";
// Configurations
dotenv.config();
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const onlineUsers = new Map();

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
   graphiql: true, 
});
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
app.use("/trucks", vehicleRoutes);
app.use("/trips", tripRoutes);
app.use("/payments", paymentRoutes);
app.use("/createTrip", createTripRoutes);
app.use("/vehicleStatus", vehicleStatusUpdate);
app.use("/notifications", notificationRoutes);
app.use("/Register/companyDetails", companyDetailsRoutes);

//graphql setup
app.use("/graphql",  (req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    next();
  },yoga);


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
      const receiverSocketId = onlineUsers.get(toUser);
      const fromUserSocketId = onlineUsers.get(shipperId);
      const findUser: any = await prisma.users.findUnique({
        where: { id: shipperId },
      });
      const isShipper = ["INDIVIDUAL_SHIPPER", "SHIPPER_COMPANY"].includes(
        findUser?.type
      );
      const priceField = isShipper
        ? "negotiateShipperPrice"
        : "negotiateDriverPrice";
      console.log("event triggered");
      if (!receiverSocketId) {
        const updatedBidAmount = await prisma.bid.update({
          where: { id: bidId },
          data: { [priceField]: price },
        });
        console.log("user offline , we updating in databse");
        io.to(fromUserSocketId).emit(
          "receiveUpdatedBidPrice",
          updatedBidAmount
        );
        if (isShipper) {
          const createNotification = await prisma.notification.create({
            data: {
              userId: toUser,
              type: "BID_PRICE_UPDATED",
              title: "Bid price updated",
              message: `For this load ID  ${updatedBidAmount.loadId} , Bid amount updated by shipper`,
            },
          });
        } else {
          const createNotification = await prisma.notification.create({
            data: {
              userId: shipperId,
              type: "BID_PRICE_UPDATED",
              title: "Bid price updated",
              message: `For this load ID ${updatedBidAmount.loadId}, Bid amount updated by driver`,
            },
          });
        }
        return;
      }

      const updatedBidAmount = await prisma.bid.update({
        where: { id: bidId },
        data: { [priceField]: price },
      });
      console.log(`socket id :${receiverSocketId} for this user ${toUser}`);
      io.to(receiverSocketId).emit("receiveUpdatedBidPrice", updatedBidAmount);
      io.to(fromUserSocketId).emit("receiveUpdatedBidPrice", updatedBidAmount);

      const createNotification = await prisma.notification.create({
        data: {
          userId: shipperId,
          type: "BID_PRICE_UPDATED",
          title: "Bid price updated",
          message: `For this load ID ${updatedBidAmount.loadId}, Bid amount updated by driver`,
        },
      });
      io.to(receiverSocketId).emit(
        "receiveBidPriceNotification",
        createNotification
      );
    } catch (error) {
      console.error("Error updating bid amount:", error);
    }
  });

  // Updating bid status
  socket.on("updateBidStatus", async ({ bidId, shipperId, toUser, loadId }) => {
    try {
      const receiverSocketId = onlineUsers.get(toUser);
      const fromUserSocketId = onlineUsers.get(shipperId);
      const findUser = await prisma.users.findUnique({
        where: { id: shipperId },
      });
      const isShipper =
        findUser?.type === "SHIPPER_COMPANY" ||
        findUser?.type === "INDIVIDUAL_SHIPPER";

      const statusField = isShipper ? "isShipperAccepted" : "isDriverAccepted";
      if (!receiverSocketId) {
        const updatedBidStatus = await prisma.bid.update({
          where: { id: bidId },
          data: {
            [statusField]: true,
            status:
              statusField === "isShipperAccepted" ? "ACCEPTED" : "PENDING",
          },
        });
        const updateLoadStatus = await prisma.loads.update({
          where: {
            id: loadId,
          },
          data: {
            status:
              statusField === "isShipperAccepted" ? "ASSIGNED" : "AVAILABLE",
          },
        });

        const createNotification = await prisma.notification.create({
          data: {
            userId: updateLoadStatus.shipperId,
            type: "LOAD_ACCEPTED",
            title: "load accepted",
            message: `This load ID ${updatedBidStatus.loadId} has accepted by driver`,
          },
        });

        io.to(fromUserSocketId).emit(
          "receiveUpdatedBidPrice",
          updatedBidStatus
        );
        return;
      }

      const updatedBidStatus = await prisma.bid.update({
        where: { id: bidId },
        data: {
          [statusField]: true,
          status: statusField === "isShipperAccepted" ? "ACCEPTED" : "PENDING",
        },
      });
      const updateLoadStatus = await prisma.loads.update({
        where: {
          id: loadId,
        },
        data: {
          status:
            statusField === "isShipperAccepted" ? "ASSIGNED" : "AVAILABLE",
        },
      });

      console.log(updatedBidStatus);

      const createNotification = await prisma.notification.create({
        data: {
          userId: updateLoadStatus.shipperId,
          type: "LOAD_ACCEPTED",
          title: "load accepted",
          message: `This load ID ${updatedBidStatus.loadId} has accepted by driver`,
        },
      });
      io.to(receiverSocketId).emit(
        "receiveLoadAcceptanceNotification",
        createNotification
      );

      io.to(receiverSocketId).emit("receiveUpdatedBidStatus", updatedBidStatus);
      io.to(fromUserSocketId).emit("receiveUpdatedBidStatus", updatedBidStatus);
    } catch (error) {
      console.error("Error updating bid status:", error);
    }
  });

  socket.on("passNewBid", async ({ newBid, toUser }) => {
    const receiverSocketId = onlineUsers.get(toUser);
    const fromUserId = newBid.carrierId;
    const fromUserSocketId = onlineUsers.get(fromUserId);
    const createNotification = await prisma.notification.create({
      data: {
        userId: toUser,
        type: "NEW_BID",
        title: "New bid arrived for your load",
        message: `Your Load ID  ${newBid.loadId} , new bid has arrived`,
      },
    });
    io.to(receiverSocketId).emit(
      "receiveNewBidNotification",
      createNotification
    );
    io.to(receiverSocketId).emit("receiveNewBid", newBid);
    io.to(fromUserSocketId).emit("receiveNewBid", newBid);
  });

  socket.on(
    "acceptAfterDriverBidViaSocket",
    async ({ bidId, shipperId, toUser, price, loadId }) => {
      const receiverSocketId = onlineUsers.get(toUser);
      const fromUserSocketId = onlineUsers.get(shipperId);
      if (!receiverSocketId) {
        const updateBid = await prisma.bid.update({
          where: {
            id: bidId,
          },
          data: {
            isDriverAccepted: true,
            isShipperAccepted: true,
            negotiateShipperPrice: Number(price),
          },
        });
        const updateLoadStatus = await prisma.loads.update({
          where: {
            id: loadId,
          },
          data: {
            status: "ASSIGNED",
          },
        });

        const createNotification = await prisma.notification.create({
          data: {
            userId: toUser,
            type: "LOAD_ACCEPTED",
            title: "Load accepted",
            message: ` Load ${updateBid.loadId} has accepted by the shipper`,
          },
        });

        io.to(fromUserSocketId).emit(
          "receiveAfterDriverBidViaSocket",
          updateBid
        );
        return;
      }

      const updateBid = await prisma.bid.update({
        where: {
          id: bidId,
        },
        data: {
          isDriverAccepted: true,
          isShipperAccepted: true,
          negotiateShipperPrice: Number(price),
          status: "ACCEPTED",
        },
      });

      const updateLoadStatus = await prisma.loads.update({
        where: {
          id: loadId,
        },
        data: {
          status: "ASSIGNED",
        },
      });
      const createNotification = await prisma.notification.create({
        data: {
          userId: toUser,
          type: "LOAD_ACCEPTED",
          title: "Load accepted",
          message: ` Load ${updateBid.loadId} has accepted by the shipper`,
        },
      });
      io.to(receiverSocketId).emit(
        "receiveLoadAcceptanceByShipperNotification",
        createNotification
      );

      io.to(receiverSocketId).emit("receiveAfterDriverBidViaSocket", updateBid);
      io.to(fromUserSocketId).emit("receiveAfterDriverBidViaSocket", updateBid);
    }
  );

  socket.on("fixedAcceptLoad", async ({ loadId, toUser, fromUser }) => {
    if (!loadId || !toUser || !fromUser) {
      console.error("Invalid payload for fixedAcceptLoad", {
        loadId,
        toUser,
        fromUser,
      });
      return;
    }

    try {
      const receiverSocketId = onlineUsers.get(toUser);
      const fromUserSocketId = onlineUsers.get(fromUser);

      if (!receiverSocketId) {
        const updateLoad = await prisma.loads.update({
          where: {
            id: loadId,
          },
          data: {
            status: "ASSIGNED",
          },
        });

        const createBid = await prisma.bid.create({
          data: {
            loadId,
            carrierId: fromUser,
            price: updateLoad.price,
            status: "ACCEPTED",
            vehicleId: null,
            negotiateDriverPrice: updateLoad.price,
            negotiateShipperPrice: updateLoad.price,
            isDriverAccepted: true,
            isShipperAccepted: true,
            estimatedDuration: 0,
          },
        });

        const createNotification = await prisma.notification.create({
          data: {
            userId: toUser,
            type: "LOAD_ACCEPTED",
            title: "Load accepted",
            message: `Your Load ${loadId} has accepted by driver`,
          },
        });

        io.to(receiverSocketId).emit("receiveFixedLoad", createBid);
        io.to(fromUserSocketId).emit("receiveFixedLoad", createBid);
        return;
      }
      const updateLoad = await prisma.loads.update({
        where: {
          id: loadId,
        },
        data: {
          status: "ASSIGNED",
        },
      });

      const createBid = await prisma.bid.create({
        data: {
          loadId,
          carrierId: fromUser,
          price: updateLoad.price,
          status: "ACCEPTED",
          vehicleId: null,
          negotiateDriverPrice: updateLoad.price,
          negotiateShipperPrice: updateLoad.price,
          isDriverAccepted: true,
          isShipperAccepted: true,
          estimatedDuration: 0,
        },
      });
      const load = await prisma.loads.findUnique({
        where: { id: loadId },
      });
      const createNotification = await prisma.notification.create({
        data: {
          userId: toUser,
          type: "LOAD_ACCEPTED",
          title: "Load accepted",
          message: `Your Load ${loadId} has accepted by driver`,
        },
      });
      io.to(receiverSocketId).emit(
        "receiveFixedLoadAcceptanceNotification",
        createNotification
      );
      io.to(receiverSocketId).emit("receiveFixedLoad", createBid);
      io.to(fromUserSocketId).emit("receiveFixedLoad", createBid);
    } catch (e) {
      console.log(e);
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
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
