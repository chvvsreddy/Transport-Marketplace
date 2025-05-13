import { Router } from "express";
import {
  createVehicle,
  getAllVehiclesById,
} from "../controllers/vehicleController";

const router = Router();
router.post("/", createVehicle);
router.put("/", getAllVehiclesById);
export default router;
