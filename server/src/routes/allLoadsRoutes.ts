import { Router } from "express";
import {getAllLoads, getLoadsById} from '../controllers/loadsController'
import { authenticateToken } from "../authMiddleware";

const router = Router();

router.get("/",authenticateToken, getAllLoads)
router.post("/",authenticateToken,getLoadsById);

export default router ;