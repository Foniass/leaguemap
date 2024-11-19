import axios from "axios";

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);

	try {
		const resChampionsRates = await axios.get(
			"https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json"
		);
		const championsRates = resChampionsRates.data.data;
		return new Response(JSON.stringify(championsRates), { status: 200 });
	} catch (e) {
		return new Response(JSON.stringify({ error: "Failed to fetch data." }), { status: 500 });
	}
}
