import { Router } from "express";
import {
  createVehicle,
  getActiveVehiclesById,
  getAllVehiclesById,
} from "../controllers/vehicleController";
import { authenticateToken } from "../authMiddleware";

const router = Router();
router.post("/",authenticateToken, createVehicle);
router.patch("/",authenticateToken, getAllVehiclesById);
router.put("/", authenticateToken,getActiveVehiclesById);

export default router;
