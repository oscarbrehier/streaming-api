import { Router } from "express";
import { mediaCheckController } from "../controllers/health/media.controllers.js";
import { sysInfoController } from "../controllers/health/system.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/media", authMiddleware, mediaCheckController);
router.get("/system", authMiddleware, sysInfoController);

export default router;