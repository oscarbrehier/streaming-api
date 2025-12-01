import { Request, Response, Router } from "express";
import { streamMediaController } from "../controllers/media/stream.controllers.js";

const router = Router();

router.use(/^\/([a-zA-Z0-9_-]+)\/(.+)$/, streamMediaController);

router.options(/^\/([a-zA-Z0-9_-]+)\/(.+)$/, (req: Request, res: Response) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Range');
	res.status(204).send();
});

export default router;