import { Request, Response, Router } from "express";
import { sysInfoController } from "../controllers/health/system.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
	return res.sendStatus(200);
});
router.get("/system", authMiddleware, sysInfoController);

export default router;