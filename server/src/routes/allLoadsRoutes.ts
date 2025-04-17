import { Router } from "express";
import {getAllLoads, getLoadsById} from '../controllers/loadsController'

const router = Router();

router.get("/", getAllLoads)
router.post("/",getLoadsById);

export default router ;