import { Router } from "express";
import { createChanllengeController } from "../controllers/2fa/createChallenge.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { verifyChallengeController } from "../controllers/2fa/verifyChallenge.controllers.js";
import { checkStatusController } from "../controllers/2fa/checkStatus.controllers.js";

const router = Router();

router.post("/initiate", authMiddleware, createChanllengeController);
router.post("/verify", authMiddleware, verifyChallengeController);
router.get("/status", authMiddleware, checkStatusController);

export default router;