import { Router } from "express";
import { createBid, getAllBids } from "../controllers/allBids";

const router = Router();
router.get("/", getAllBids);
router.post("/", createBid);
export default router;
