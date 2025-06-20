import { Router } from "express";
import { getLoadBidTripPaymentByUserIdFilter } from "../controllers/payments";
import { authenticateToken } from "../authMiddleware";

const router = Router();
router.post("/", authenticateToken,getLoadBidTripPaymentByUserIdFilter);

export default router;
