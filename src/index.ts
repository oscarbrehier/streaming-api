import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

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

app.listen(port, () => {
	console.log(`Listening on port: ${port}`);
});