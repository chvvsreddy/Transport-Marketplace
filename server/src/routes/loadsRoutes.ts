import { Router } from "express";
import { getLoadByLoadId } from "../controllers/loads";

const router = Router();

router.get("/:loadId", getLoadByLoadId);

export default router;
