import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { initializeDirectories } from "./utils/initializeDirectories.js";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 3001;

const allowedDomains = [
	process.env.APP_URL
].filter(d => d != undefined);

app.use(cors({
	origin: allowedDomains,
	credentials: true,
	allowedHeaders: ['Authorization', 'Content-Type', 'Accept']
}));

app.use(cookieParser());

app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

app.get("/", (req: Request, res: Response) => {

	return res.status(200).json({
		information: `Disclaimer
This backend service is developed for educational and learning purposes only and is not intended for production use.
The service does not host, store, upload, or permanently distribute any copyrighted media. It functions as a technical intermediary that proxies or relays requests to media streams hosted on third-party websites that are publicly accessible on the internet.
All media content is served directly from external providers. This service does not own, control, operate, or endorse any third-party websites or the content they provide.
Responsibility for the content accessed through this service lies with the respective third-party content hosts. Users are responsible for ensuring that their use of this service complies with applicable laws and regulations in their jurisdiction.
If you are a copyright holder and believe that any content accessed through this service infringes your rights, please contact the relevant hosting provider or notify us so we may review and remove references if appropriate.` });

});

app.use("/api", routes);

async function startServer() {

	try {

		await initializeDirectories();

		app.listen(port, () => {
			console.log(`Listening on port: ${port}`);
		});

	} catch (err) {

		console.log("Failed to start server:", err);
		process.exit(1);

	};

};

startServer();