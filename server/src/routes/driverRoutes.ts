import { Router } from "express";
import { updateDriverLocation } from "../controllers/driverController";
const router = Router();
router.post("/", updateDriverLocation);
export default router;
