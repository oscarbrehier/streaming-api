import { Router } from "express";
import { sysInfoController } from "../controllers/health/system.controllers.js";
import { internalAuth } from "../middleware/internalAuth.middleware.js";

const router = Router();

router.get("/system", internalAuth, sysInfoController);

export default router;