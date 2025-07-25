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
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

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
import uploadRoutes from "./routes/uploadRoute";
import distanceRoutes from "./routes/distance";
import individualShipperRoutes from "./routes/individualshipperRoutes";
import individualDriverRoutes from "./routes/individualDriverRoutes";
import adminProfileUsersRoutes from "./routes/adminUserProfileRoutes";
// Configurations
dotenv.config();
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

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
app.use("/upload", uploadRoutes);
app.use("/distance", distanceRoutes);
app.use("/Register/individualShipperDetails", individualShipperRoutes);
app.use("/Register/individualDriverDetails", individualDriverRoutes);
app.use("/admin/users", adminProfileUsersRoutes);

type Coordinate = {
  lat: number;
  lng: number;
};

//graphql setup
app.use(
  "/graphql",
  (req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    next();
  },
  yoga
);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

async function setupSocketServer() {
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));

  const onlineUsersKey = "onlineUsers";

  // Socket Event Handling
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Registering user with their socket ID
    socket.on("register", async (userId) => {
      console.log(
        `Registered user: ${userId} | Active clients: ${io.engine.clientsCount}`
      );
    });

    socket.on("sendAdminIdForOnlineUsers", async (userId) => {
      await pubClient.hSet(onlineUsersKey, userId, socket.id);

      const userIds = await pubClient.hKeys(onlineUsersKey);
      io.emit("onlineUsers", userIds); // only to this admin socket

      console.log("onlineUsers", userIds);
    });

    socket.on(
      "updateBidAmount",
      async ({ bidId, shipperId, price, toUser }) => {
        try {
          const receiverSocketId = await pubClient.hGet("onlineUsers", toUser);
          const fromUserSocketId = await pubClient.hGet(
            "onlineUsers",
            shipperId
          );

          const findUser = await prisma.users.findUnique({
            where: { id: shipperId },
          });

          const isShipper = ["INDIVIDUAL_SHIPPER", "SHIPPER_COMPANY"].includes(
            findUser?.type || ""
          );

          const priceField = isShipper
            ? "negotiateShipperPrice"
            : "negotiateDriverPrice";

          console.log("event triggered");

          // Update bid in all cases
          const updatedBidAmount = await prisma.bid.update({
            where: { id: bidId },
            data: { [priceField]: price },
          });

          console.log(
            receiverSocketId
              ? `Online user. Sending to socket ID: ${receiverSocketId}`
              : "User is offline. No socket to emit to."
          );

          // Emit to receiver if online
          if (receiverSocketId) {
            io.to(receiverSocketId).emit(
              "receiveUpdatedBidPrice",
              updatedBidAmount
            );

            // Notify receiver
            const createNotification = await prisma.notification.create({
              data: {
                userId: toUser,
                type: "BID_PRICE_UPDATED",
                title: "Bid price updated",
                message: `For this load ID ${
                  updatedBidAmount.loadId
                }, Bid amount updated by ${isShipper ? "shipper" : "driver"}`,
              },
            });

            io.to(receiverSocketId).emit(
              "receiveBidPriceNotification",
              createNotification
            );
          } else {
            // User offline, save notification only
            await prisma.notification.create({
              data: {
                userId: toUser,
                type: "BID_PRICE_UPDATED",
                title: "Bid price updated",
                message: `For this load ID ${
                  updatedBidAmount.loadId
                }, Bid amount updated by ${isShipper ? "shipper" : "driver"}`,
              },
            });
          }

          // Emit to sender (shipper or driver) if they’re online
          if (fromUserSocketId) {
            io.to(fromUserSocketId).emit(
              "receiveUpdatedBidPrice",
              updatedBidAmount
            );
          }
        } catch (error) {
          console.error("Error updating bid amount:", error);
        }
      }
    );
    type Coordinate = {
      lat: number;
      lng: number;
    };

    type Load = {
      id: string;
      origin: Coordinate;
      specialRequirements: {
        size: string;
        acOption: string;
        trollyOption: string;
      };
      destination: Coordinate;
      shipperId: string;
      status: string;
      cargoType: string;
      weight: number;
      bidPrice: number;
      price: number;
      createdAt: string;
      pickupWindowStart: string;
      deliveryWindowEnd: string;
    };

    type Driver = {
      id: string;
      userId: string;
      currentLocation: Coordinate;
    };

    type DistanceMatrixResponse = {
      rows: {
        elements: {
          status: string;
          distance: {
            value: number; // in meters
          };
        }[];
      }[];
    };

    socket.on("sendLoadNearDriver", async (load: Load) => {
      const loadOrigin = `${load.origin.lat ?? 0},${load.origin.lng ?? 0}`;
      console.log("load came to socket", load);
      try {
        // 1. Fetch drivers
        const rawDrivers = await prisma.driverDetails.findMany({
          select: {
            id: true,
            userId: true,
            currentLocation: true,
          },
        });

        const eligibleVehicles = await prisma.vehicle.findMany({
          where: {
            AND: [
              {
                vehicleType: {
                  path: ["size"],
                  equals: load.specialRequirements.size,
                },
              },
              {
                vehicleType: {
                  path: ["acOption"],
                  equals: load.specialRequirements.acOption,
                },
              },
              {
                vehicleType: {
                  path: ["trollyOption"],
                  equals: load.specialRequirements.trollyOption,
                },
              },
              {
                isVehicleVerified: true,
              },
            ],
          },
          select: {
            ownerId: true,
          },
        });

        const eligibleUserIds = new Set(eligibleVehicles.map((v) => v.ownerId));

        const drivers: Driver[] = rawDrivers
          .map((driver) => {
            let parsedLocation: Coordinate | null = null;

            try {
              if (typeof driver.currentLocation === "string") {
                parsedLocation = JSON.parse(driver.currentLocation);
              } else if (
                driver.currentLocation &&
                typeof driver.currentLocation === "object" &&
                "lat" in driver.currentLocation &&
                "lng" in driver.currentLocation
              ) {
                parsedLocation = driver.currentLocation as Coordinate;
              }
            } catch (e) {
              console.error("Invalid location JSON for driver:", driver.id, e);
            }

            if (
              parsedLocation &&
              typeof parsedLocation.lat === "number" &&
              typeof parsedLocation.lng === "number" &&
              eligibleUserIds.has(driver.userId)
            ) {
              return {
                id: driver.id,
                userId: driver.userId,
                currentLocation: parsedLocation,
              };
            }

            return null;
          })
          .filter((d): d is Driver => d !== null);

        if (drivers.length === 0) return;

        // 4. Prepare destinations
        const destinations: Coordinate[] = drivers.map(
          (d) => d.currentLocation
        );

        // 5. Call distance API
        const distanceResponse = await fetch("http://localhost:8000/distance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: loadOrigin, destinations }),
        });

        const distanceData: DistanceMatrixResponse =
          await distanceResponse.json();

        if (
          !distanceData.rows ||
          !distanceData.rows[0]?.elements ||
          distanceData.rows[0].elements.length !== drivers.length
        ) {
          console.warn("Invalid distance data");
          return;
        }

        // 6. Filter nearby drivers (<= 50km)
        const elements = distanceData.rows[0].elements;

        const nearbyUserIds = elements
          .map((element, index) => {
            if (
              element.status === "OK" &&
              element.distance.value <= 50000 // 50km
            ) {
              return drivers[index].userId;
            }
            return null;
          })
          .filter((id): id is string => id !== null);

        console.log("Nearby Drivers (within 50km):", nearbyUserIds);

        // 7. Emit to nearby drivers
        await Promise.all(
          nearbyUserIds.map(async (userId) => {
            const receiverSocketId = await pubClient.hGet(
              "onlineUsers",
              userId
            );
            console.log(
              "loadSent",
              receiverSocketId,
              "load is",
              load,
              "userId is ",
              userId
            );
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("newLoadAvailable", load);
              console.log("loadSent", receiverSocketId, "load is", load);
            }
          })
        );
      } catch (err) {
        console.error("sendLoadNearDriver failed:", err);
      }
    });

    // Updating bid status
    socket.on(
      "updateBidStatus",
      async ({ bidId, shipperId, toUser, loadId }) => {
        try {
          const receiverSocketId = await pubClient.hGet("onlineUsers", toUser);
          const fromUserSocketId = await pubClient.hGet(
            "onlineUsers",
            shipperId
          );

          const findUser = await prisma.users.findUnique({
            where: { id: shipperId },
          });

          const isShipper =
            findUser?.type === "SHIPPER_COMPANY" ||
            findUser?.type === "INDIVIDUAL_SHIPPER";

          const statusField = isShipper
            ? "isShipperAccepted"
            : "isDriverAccepted";

          const bidStatus =
            statusField === "isShipperAccepted" ? "ACCEPTED" : "PENDING";
          const loadStatus =
            statusField === "isShipperAccepted" ? "ASSIGNED" : "AVAILABLE";

          // 📝 Update bid and load status
          const updatedBidStatus = await prisma.bid.update({
            where: { id: bidId },
            data: {
              [statusField]: true,
              status: bidStatus,
            },
          });

          const updatedLoad = await prisma.loads.update({
            where: { id: loadId },
            data: { status: loadStatus },
          });

          // 🔔 Create notification
          const notification = await prisma.notification.create({
            data: {
              userId: updatedLoad.shipperId,
              type: "LOAD_ACCEPTED",
              title: "Load Accepted",
              message: `This load ID ${
                updatedBidStatus.loadId
              } has been accepted by ${isShipper ? "shipper" : "driver"}`,
            },
          });

          // 💬 Emit to receiver (if online)
          if (receiverSocketId) {
            io.to(receiverSocketId).emit(
              "receiveLoadAcceptanceNotification",
              notification
            );

            io.to(receiverSocketId).emit(
              "receiveUpdatedBidStatus",
              updatedBidStatus
            );
          } else {
            console.log(`Receiver (${toUser}) is offline.`);
          }

          // 💬 Emit to sender (if online)
          if (fromUserSocketId) {
            io.to(fromUserSocketId).emit(
              "receiveUpdatedBidStatus",
              updatedBidStatus
            );
          } else {
            console.log(`Sender (${shipperId}) is offline.`);
          }
        } catch (error) {
          console.error("Error updating bid status:", error);
        }
      }
    );

    socket.on("passNewBid", async ({ newBid, toUser }) => {
      try {
        const receiverSocketId = await pubClient.hGet("onlineUsers", toUser);
        const fromUserId = newBid.carrierId;
        const fromUserSocketId = await pubClient.hGet(
          "onlineUsers",
          fromUserId
        );

        // 🔔 Create notification regardless of online/offline
        const createNotification = await prisma.notification.create({
          data: {
            userId: toUser,
            type: "NEW_BID",
            title: "New bid arrived for your load",
            message: `Your Load ID ${newBid.loadId} received a new bid.`,
          },
        });

        // 📤 Send to receiver (shipper) if online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "receiveNewBidNotification",
            createNotification
          );
          io.to(receiverSocketId).emit("receiveNewBid", newBid);
        } else {
          console.log(`Receiver (user: ${toUser}) is offline.`);
        }

        // 📤 Echo to sender (driver) if online
        if (fromUserSocketId) {
          io.to(fromUserSocketId).emit("receiveNewBid", newBid);
        } else {
          console.log(`Sender (user: ${fromUserId}) is offline.`);
        }
      } catch (err) {
        console.error("Error handling passNewBid:", err);
      }
    });

    socket.on(
      "acceptAfterDriverBidViaSocket",
      async ({ bidId, shipperId, toUser, price, loadId }) => {
        try {
          const receiverSocketId = await pubClient.hGet("onlineUsers", toUser);
          const fromUserSocketId = await pubClient.hGet(
            "onlineUsers",
            shipperId
          );

          // Step 1: Update bid
          const updateBid = await prisma.bid.update({
            where: { id: bidId },
            data: {
              isDriverAccepted: true,
              isShipperAccepted: true,
              negotiateShipperPrice: Number(price),
              status: "ACCEPTED",
            },
          });

          // Step 2: Update load status
          const updateLoadStatus = await prisma.loads.update({
            where: { id: loadId },
            data: { status: "ASSIGNED" },
          });

          // Step 3: Create notification
          const createNotification = await prisma.notification.create({
            data: {
              userId: toUser,
              type: "LOAD_ACCEPTED",
              title: "Load accepted",
              message: `Load ${updateBid.loadId} has been accepted by the shipper.`,
            },
          });

          // Step 4: Emit to receiver (driver)
          if (receiverSocketId) {
            io.to(receiverSocketId).emit(
              "receiveLoadAcceptanceByShipperNotification",
              createNotification
            );
            io.to(receiverSocketId).emit(
              "receiveAfterDriverBidViaSocket",
              updateBid
            );
          } else {
            console.log(`Driver (user: ${toUser}) is offline.`);
          }

          // Step 5: Emit to sender (shipper)
          if (fromUserSocketId) {
            io.to(fromUserSocketId).emit(
              "receiveAfterDriverBidViaSocket",
              updateBid
            );
          } else {
            console.log(`Shipper (user: ${shipperId}) is offline.`);
          }
        } catch (error) {
          console.error("Error in acceptAfterDriverBidViaSocket:", error);
        }
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
        const receiverSocketId = await pubClient.hGet("onlineUsers", toUser);
        const fromUserSocketId = await pubClient.hGet("onlineUsers", fromUser);

        // ✅ 1. Update Load status
        const updateLoad = await prisma.loads.update({
          where: { id: loadId },
          data: { status: "ASSIGNED" },
        });

        // ✅ 2. Create bid for the load
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

        // ✅ 3. Create notification
        const createNotification = await prisma.notification.create({
          data: {
            userId: toUser,
            type: "LOAD_ACCEPTED",
            title: "Load accepted",
            message: `Your Load ${loadId} has been accepted by the driver.`,
          },
        });

        // ✅ 4. Emit to `toUser` (shipper) if online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "receiveFixedLoadAcceptanceNotification",
            createNotification
          );
          io.to(receiverSocketId).emit("receiveFixedLoad", createBid);
        } else {
          console.log(`Receiver (user: ${toUser}) is offline.`);
        }

        // ✅ 5. Emit to `fromUser` (driver) if online
        if (fromUserSocketId) {
          io.to(fromUserSocketId).emit("receiveFixedLoad", createBid);
        } else {
          console.log(`Sender (user: ${fromUser}) is offline.`);
        }
      } catch (error) {
        console.error("Error in fixedAcceptLoad:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("Disconnected:", socket.id);
      const allUsers = await pubClient.hGetAll(onlineUsersKey);
      for (const [userId, sId] of Object.entries(allUsers)) {
        if (sId === socket.id) {
          await pubClient.hDel(onlineUsersKey, userId);
          break;
        }
      }
    });
  });
}

setupSocketServer();

// Server Setup
const port = Number(process.env.PORT) || 8000;
server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
