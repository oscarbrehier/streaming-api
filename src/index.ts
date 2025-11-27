import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { initializeDirectories } from "./utils/initializeDirectories.js";

const app = express();
const port = process.env.PORT || 3001;

const allowedDomains = [
	"http://localhost:3000",
	process.env.APP_URL
].filter(d => d != undefined);

app.use(cors({
	origin: allowedDomains
}));

app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

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