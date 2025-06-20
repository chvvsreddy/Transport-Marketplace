import { Router } from "express";
import { updateVehicle } from "../controllers/vehicleStatus";
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.put("/",authenticateToken, updateVehicle);
export default router;
