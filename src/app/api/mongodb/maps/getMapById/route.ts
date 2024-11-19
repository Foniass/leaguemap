import db from "@/src/lib/db";

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const mapId = searchParams.get("id");
	if (mapId) {
		try {
			const mapData = await db.maps.getOne.fullObj.mapId(mapId);
			if (!mapData) return new Response(JSON.stringify({ error: "No map found with this id." }), { status: 404 });
			return new Response(JSON.stringify(mapData), { status: 200 }); // HTTP status code 200 indicates success
		} catch (error: unknown) {
			const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
			return new Response(JSON.stringify({ error: "Server error, could not retrieve map.", details: errorMessage }), {
				status: 500,
			}); // HTTP status code 500 indicates a server error
		}
	} else {
		return new Response(JSON.stringify({ error: "No mapId provided." }), { status: 400 }); // HTTP status code 400 indicates a bad request
	}
}
