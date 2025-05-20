import { Router } from "express";
import { getLoadBidTripPaymentByUserIdFilter } from "../controllers/payments";

const router = Router();
router.post("/", getLoadBidTripPaymentByUserIdFilter);

export default router;
