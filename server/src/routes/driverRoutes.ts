import { Router } from "express";
import {
  getBidsByCarrierId,
  getBidsByCarrierIdForTripsAssigning,
  updateDriverLocation,
} from "../controllers/driverController";
import { authenticateToken } from "../authMiddleware";
const router = Router();
router.post("/",authenticateToken,updateDriverLocation);
router.put("/",authenticateToken, getBidsByCarrierId);
router.get("/:carrierId", authenticateToken,getBidsByCarrierIdForTripsAssigning);
export default router;
