import { Router } from "express";
import {
  createVehicle,
  getAllVehiclesById,
  updateVehicle,
} from "../controllers/vehicleController";

const router = Router();
router.post("/", createVehicle);
router.put("/", getAllVehiclesById);
router.patch("/", updateVehicle);
export default router;
