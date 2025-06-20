import { Router } from "express";
import {
  createBid,
  getAllBids,
  updateBid,
  updateBidStatus,
} from "../controllers/allBids";
import { authenticateToken } from "../authMiddleware";

const router = Router();
router.get("/",authenticateToken, getAllBids);
router.post("/",authenticateToken, createBid);
router.put("/",authenticateToken, updateBid);
router.patch("/", authenticateToken,updateBidStatus);
export default router;
