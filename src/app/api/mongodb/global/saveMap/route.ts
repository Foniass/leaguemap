import db from "@/src/lib/db";
import { MapDb } from "@/src/lib/db/maps/collection";

interface ReqBody {
	newMap: MapDb;
	email: string;
}

export async function POST(req: Request): Promise<Response> {
	const data = await req.json();

	if (typeof data !== "object" || data === null || !("newMap" in data)) {
		return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
	}

	const { newMap, email } = data as ReqBody;

	if (typeof newMap !== "object" || newMap === null || typeof email !== "string") {
		return new Response(JSON.stringify({ error: "Invalid types." }), { status: 400 });
	}

	try {
		const mapOwner = await db.users.getOne.fullObj.mapId(newMap.Global.id);
		if (!mapOwner) await db.users.saveOne.mapId.email(email, newMap.Global.id);
		else if (mapOwner.email !== email) {
			return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 }); // HTTP status code 401 indicates unauthorized
		}
		await db.maps.saveOne.fullObj.mapId(newMap);
		return new Response(JSON.stringify({ success: true }), { status: 200 }); // HTTP status code 200 indicates success
	} catch (error: unknown) {
		const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
		return new Response(
			JSON.stringify({ error: "Server error, could not complete operations.", details: errorMessage }),
			{ status: 500 }
		); // HTTP status code 500 indicates a server error
	}
}
