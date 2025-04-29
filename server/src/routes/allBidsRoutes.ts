import { Router } from "express";
import { getAllBids } from "../controllers/allBids";

const router = Router();
router.get("/", getAllBids);
export default router;
