import { Router } from "express";
import {
  createBid,
  getAllBids,
  updateBid,
  updateBidStatus,
} from "../controllers/allBids";

const router = Router();
router.get("/", getAllBids);
router.post("/", createBid);
router.put("/", updateBid);
router.patch("/", updateBidStatus);
export default router;
