import { Router } from "express";
import { getBidsByCarrierId, updateDriverLocation } from "../controllers/driverController";
const router = Router();
router.post("/", updateDriverLocation);
router.put("/",getBidsByCarrierId)
export default router;
