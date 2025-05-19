import { Router } from "express";
import { createTrip, getBidsByLoadId, getTripsByLoadId } from "../controllers/trips";

const router = Router();

router.post("/", getBidsByLoadId);
router.put("/", getTripsByLoadId);
router.patch("/",createTrip)

export default router;
