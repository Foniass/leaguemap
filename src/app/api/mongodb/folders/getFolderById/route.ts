import db from "@/src/lib/db";

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const folderId = searchParams.get("folderId");
	if (folderId) {
		try {
			const folderDb = await db.folders.getOne.fullObj.folderId(folderId);
			if (!folderDb) return new Response(JSON.stringify({ error: "No folder found." }), { status: 404 }); // HTTP status code 404 indicates a resource not found
			return new Response(JSON.stringify(folderDb), { status: 200 }); // HTTP status code 200 indicates success
		} catch (error: unknown) {
			const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
			return new Response(
				JSON.stringify({ error: "Server error, could not retrieve folder.", details: errorMessage }),
				{
					status: 500,
				}
			); // HTTP status code 500 indicates a server error
		}
	} else {
		return new Response(JSON.stringify({ error: "No folderId provided." }), { status: 400 }); // HTTP status code 400 indicates a bad request
	}
}
