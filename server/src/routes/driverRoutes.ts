import { Router } from "express";
import {
  getBidsByCarrierId,
  getBidsByCarrierIdForTripsAssigning,
  updateDriverLocation,
} from "../controllers/driverController";
const router = Router();
router.post("/", updateDriverLocation);
router.put("/", getBidsByCarrierId);
router.get("/:carrierId", getBidsByCarrierIdForTripsAssigning);
export default router;
