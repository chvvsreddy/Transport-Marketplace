import { Router } from "express";
import {
  createVehicle,
  getActiveVehiclesById,
  getAllVehiclesById,
} from "../controllers/vehicleController";

const router = Router();
router.post("/", createVehicle);
router.patch("/", getAllVehiclesById);
router.put("/", getActiveVehiclesById);

export default router;
