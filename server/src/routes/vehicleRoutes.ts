import { Router } from "express";
import {
  createVehicle,
  getActiveVehiclesById,
  getAllVehiclesById,
  getSingleVehicleByOwnerId,
} from "../controllers/vehicleController";
import { authenticateToken } from "../authMiddleware";

const router = Router();
router.post("/", createVehicle);
router.patch("/", authenticateToken, getAllVehiclesById);
router.put("/", authenticateToken, getActiveVehiclesById);
router.get("/:userId", getSingleVehicleByOwnerId);

export default router;
