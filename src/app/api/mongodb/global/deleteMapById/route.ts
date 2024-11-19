import db from "@/src/lib/db";

interface ReqBody {
	email: string;
	mapId: string;
}

export async function POST(req: Request): Promise<Response> {
	const data = await req.json();

	if (typeof data !== "object" || data === null || !("email" in data) || !("mapId" in data)) {
		return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
	}

	const { email, mapId } = data as ReqBody;

	if (typeof email !== "string" || typeof mapId !== "string")
		return new Response(JSON.stringify({ error: "Invalid types." }), { status: 400 });

	try {
		const owner = await db.users.getOne.fullObj.mapId(mapId);
		if (owner?.email !== email)
			return new Response(JSON.stringify({ error: "Server error, could not delete map." }), { status: 500 });
		const res1 = await db.users.deleteOne.mapId.email(email, mapId);
		const res2 = await db.maps.deleteOne.mapId(mapId);
		if (res1 !== res2)
			return new Response(JSON.stringify({ error: "Server error, Error while deleting the map" }), { status: 500 });
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error: unknown) {
		const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
		return new Response(
			JSON.stringify({ error: "Server error, could not complete operations.", details: errorMessage }),
			{ status: 500 }
		); // HTTP status code 500 indicates a server error
	}
}
