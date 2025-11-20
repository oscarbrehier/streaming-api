import { Router } from "express";
import { mediaCheckController } from "../controllers/health/media.controllers.js";
import { sysInfoController } from "../controllers/health/system.controllers.js";

const router = Router();

router.get("/media", mediaCheckController);
router.get("/system", sysInfoController);

export default router;