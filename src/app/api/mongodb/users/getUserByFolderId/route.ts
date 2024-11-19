import db from "@/src/lib/db";

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const folderId = searchParams.get("folderId");
	if (folderId) {
		try {
			const userData = await db.users.getOne.fullObj.folderId(folderId);
			if (userData === null) return new Response(JSON.stringify({ error: "No user found." }), { status: 404 }); // HTTP status code 404 indicates a not found error
			return new Response(JSON.stringify(userData), { status: 200 }); // HTTP status code 200 indicates success
		} catch (error: unknown) {
			const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
			return new Response(JSON.stringify({ error: "Server error, could not retrieve user.", details: errorMessage }), {
				status: 500,
			}); // HTTP status code 500 indicates a server error
		}
	} else {
		return new Response(JSON.stringify({ error: "No folderId provided." }), { status: 400 }); // HTTP status code 400 indicates a bad request
	}
}
