export async function requestContent(mediaId: string, type: "movie" | "tv", season?: string, episode?: string) {

	if (type === "tv" && (!season || !episode)) throw new Error("TV type requires both season and episode to be specified");

	const requestUrl = new URL(`${process.env.SCRAPER_URL}/${type}/${mediaId}`);

	if (type === "tv") {
		requestUrl.searchParams.append("s", season!);
		requestUrl.searchParams.append("e", episode!);
	}

	const fetchPromise = fetch(requestUrl.toString(), {
		headers: {
			"Authorization": `Bearer ${process.env.SCRAPER_API_KEY}`
		}
	});

	const timeoutPromise = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), 5000));

	const result = await Promise.race([fetchPromise, timeoutPromise]);

	if (result === "timeout") {

		fetchPromise.catch(err => {
			console.error("Background fetch failed:", err);
		});

		return null;

	};

	if (!result.ok) {
		throw new Error(`Request failed with status ${result.status}`);
	};

	return result.json();

};