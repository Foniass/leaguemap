import db from "@/src/lib/db";
import { FolderDb } from "@/src/lib/db/folders/collection";

interface ReqBody {
	email: string;
	folder: FolderDb;
}

export async function POST(req: Request): Promise<Response> {
	const data = await req.json();

	if (typeof data !== "object" || data === null || !("folder" in data) || !("email" in data)) {
		return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
	}

	const { folder, email } = data as ReqBody;

	if (typeof folder !== "object" || folder === null || typeof email !== "string")
		return new Response(JSON.stringify({ error: "Invalid types." }), { status: 400 });

	try {
		const folderOwner = await db.users.getOne.fullObj.folderId(folder.id);
		if (!folderOwner) await db.users.saveOne.folderId.email(email, folder.id);
		else if (folderOwner.email !== email) {
			return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 }); // HTTP status code 401 indicates unauthorized
		}
		await db.folders.saveOne.fullObj.folderId(folder);
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error: unknown) {
		const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
		return new Response(JSON.stringify({ error: "Server error, could not create folder.", details: errorMessage }), {
			status: 500,
		});
	}
}
