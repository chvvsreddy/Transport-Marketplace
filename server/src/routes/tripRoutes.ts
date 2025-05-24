import { Router } from "express";
import {  getBidsByLoadId, getTripsByLoadId } from "../controllers/trips";

const router = Router();

router.post("/", getBidsByLoadId);
router.put("/", getTripsByLoadId);


export default router;
