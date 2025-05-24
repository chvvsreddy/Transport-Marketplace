import { Router } from "express";
import { updateVehicle } from "../controllers/vehicleStatus";

const router = Router();

router.put("/", updateVehicle);
export default router;
