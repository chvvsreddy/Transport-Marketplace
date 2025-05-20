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
import vehicleRoutes from "./routes/vehicleRoutes";
import tripRoutes from "./routes/tripRoutes";
import paymentRoutes from "./routes/paymentRoutes";

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
app.use("/trucks", vehicleRoutes);
app.use("/trips", tripRoutes);
app.use("/payments", paymentRoutes);

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
        return;
      }

      const updatedBidAmount = await prisma.bid.update({
        where: { id: bidId },
        data: { [priceField]: price },
      });
      console.log(`socket id :${receiverSocketId} for this user ${toUser}`);
      io.to(receiverSocketId).emit("receiveUpdatedBidPrice", updatedBidAmount);
      io.to(fromUserSocketId).emit("receiveUpdatedBidPrice", updatedBidAmount);
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
        if (
          updatedBidStatus.isDriverAccepted &&
          updatedBidStatus.isShipperAccepted
        ) {
          const driverVehicle = await prisma.vehicle.findFirst({
            where: {
              ownerId: updatedBidStatus.carrierId,
            },
          });

          // Validate vehicle existence
          if (!driverVehicle) {
            console.error(
              `No vehicle found for driver ID: ${updatedBidStatus.carrierId}`
            );
            return;
          }

          // Fetch load origin and destination
          const load = await prisma.loads.findUnique({
            where: { id: loadId },
          });

          const originData =
            typeof load?.origin === "string"
              ? JSON.parse(load.origin)
              : load?.origin;

          const destinationData =
            typeof load?.destination === "string"
              ? JSON.parse(load.destination)
              : load?.destination;

          // Validate coordinates
          if (
            !originData?.lat ||
            !originData?.lng ||
            !destinationData?.lat ||
            !destinationData?.lng
          ) {
            console.error("Missing origin or destination coordinates.");
            return;
          }

          // Create Trip with proper structure
          const createTrip = await prisma.trips.create({
            data: {
              driverId: updatedBidStatus.carrierId,
              loadId,
              vehicleId: driverVehicle.id,
              estimatedDuration: 0.0,
              distance: 0.0,
              plannedRoute: {
                distance: 0,
                waypoints: [
                  {
                    lat: originData.lat,
                    lng: originData.lng,
                  },
                  {
                    lat: destinationData.lat,
                    lng: destinationData.lng,
                  },
                ],
              },
            },
          });

          console.log("Trip created successfully:", createTrip);
        }
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

      if (
        updatedBidStatus.isDriverAccepted &&
        updatedBidStatus.isShipperAccepted
      ) {
        const driverVehicle = await prisma.vehicle.findFirst({
          where: {
            ownerId: updatedBidStatus.carrierId,
          },
        });

        // Validate vehicle existence
        if (!driverVehicle) {
          console.error(
            `No vehicle found for driver ID: ${updatedBidStatus.carrierId}`
          );
          return;
        }

        // Fetch load origin and destination
        const load = await prisma.loads.findUnique({
          where: { id: loadId },
        });

        const originData =
          typeof load?.origin === "string"
            ? JSON.parse(load.origin)
            : load?.origin;

        const destinationData =
          typeof load?.destination === "string"
            ? JSON.parse(load.destination)
            : load?.destination;

        // Validate coordinates
        if (
          !originData?.lat ||
          !originData?.lng ||
          !destinationData?.lat ||
          !destinationData?.lng
        ) {
          console.error("Missing origin or destination coordinates.");
          return;
        }

        // Create Trip with proper structure
        const createTrip = await prisma.trips.create({
          data: {
            driverId: updatedBidStatus.carrierId,
            loadId,
            vehicleId: driverVehicle.id,
            estimatedDuration: 0.0,
            distance: 0.0,
            plannedRoute: {
              distance: 0,
              waypoints: [
                {
                  lat: originData.lat,
                  lng: originData.lng,
                },
                {
                  lat: destinationData.lat,
                  lng: destinationData.lng,
                },
              ],
            },
          },
        });

        console.log("Trip created successfully:", createTrip);
      }

      console.log(updatedBidStatus);

      io.to(receiverSocketId).emit("receiveUpdatedBidStatus", updatedBidStatus);
      io.to(fromUserSocketId).emit("receiveUpdatedBidPrice", updatedBidStatus);
    } catch (error) {
      console.error("Error updating bid status:", error);
    }
  });

  socket.on("passNewBid", async ({ newBid, toUser }) => {
    const receiverSocketId = onlineUsers.get(toUser);
    const fromUserId = newBid.carrierId;
    const fromUserSocketId = onlineUsers.get(fromUserId);
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
        const driverVehicle = await prisma.vehicle.findFirst({
          where: {
            ownerId: updateBid.carrierId,
          },
        });

        // Validate vehicle existence
        if (!driverVehicle) {
          console.error(
            `No vehicle found for driver ID: ${updateBid.carrierId}`
          );
          return;
        }

        // Fetch load origin and destination
        const load = await prisma.loads.findUnique({
          where: { id: loadId },
        });

        const originData =
          typeof load?.origin === "string"
            ? JSON.parse(load.origin)
            : load?.origin;

        const destinationData =
          typeof load?.destination === "string"
            ? JSON.parse(load.destination)
            : load?.destination;

        // Validate coordinates
        if (
          !originData?.lat ||
          !originData?.lng ||
          !destinationData?.lat ||
          !destinationData?.lng
        ) {
          console.error("Missing origin or destination coordinates.");
          return;
        }

        // Create Trip with proper structure
        const createTrip = await prisma.trips.create({
          data: {
            driverId: updateBid.carrierId,
            loadId,
            vehicleId: driverVehicle.id,
            estimatedDuration: 0.0,
            distance: 0.0,
            plannedRoute: {
              distance: 0,
              waypoints: [
                {
                  lat: originData.lat,
                  lng: originData.lng,
                },
                {
                  lat: destinationData.lat,
                  lng: destinationData.lng,
                },
              ],
            },
          },
        });

        console.log("Trip created successfully:", createTrip);
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

      const driverVehicle = await prisma.vehicle.findFirst({
        where: {
          ownerId: updateBid.carrierId,
        },
      });

      // Validate vehicle existence
      if (!driverVehicle) {
        console.error(`No vehicle found for driver ID: ${updateBid.carrierId}`);
        return;
      }

      // Fetch load origin and destination
      const load = await prisma.loads.findUnique({
        where: { id: loadId },
      });

      const originData =
        typeof load?.origin === "string"
          ? JSON.parse(load.origin)
          : load?.origin;

      const destinationData =
        typeof load?.destination === "string"
          ? JSON.parse(load.destination)
          : load?.destination;

      // Validate coordinates
      if (
        !originData?.lat ||
        !originData?.lng ||
        !destinationData?.lat ||
        !destinationData?.lng
      ) {
        console.error("Missing origin or destination coordinates.");
        return;
      }

      // Create Trip with proper structure
      const createTrip = await prisma.trips.create({
        data: {
          driverId: updateBid.carrierId,
          loadId,
          vehicleId: driverVehicle.id,
          estimatedDuration: 0.0,
          distance: 0.0,
          plannedRoute: {
            distance: 0,
            waypoints: [
              {
                lat: originData.lat,
                lng: originData.lng,
              },
              {
                lat: destinationData.lat,
                lng: destinationData.lng,
              },
            ],
          },
        },
      });

      console.log("Trip created successfully:", createTrip);

      io.to(receiverSocketId).emit("receiveAfterDriverBidViaSocket", updateBid);
      io.to(fromUserSocketId).emit("receiveAfterDriverBidViaSocket", updateBid);
    }
  );

  socket.on("fixedAcceptLoad", async (loadId) => {
    const updateLoad = await prisma.loads.update({
      where: {
        id: loadId,
      },
      data: {
        status: "ASSIGNED",
      },
    });
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
