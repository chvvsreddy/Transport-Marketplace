import { Router } from "express";
import {getAllLoads} from '../controllers/loadsController'

const router = Router();

router.get("/", getAllLoads)

export default router ;