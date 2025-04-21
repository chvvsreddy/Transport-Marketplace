import { Router } from "express";
import { getLoadByLoadIdForAdmin } from "../controllers/adminLoads";

const router = Router();

router.get("/:loadId", getLoadByLoadIdForAdmin);

export default router;
