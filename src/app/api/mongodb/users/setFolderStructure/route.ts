import db from "@/src/lib/db";
import { FolderStructureItem } from "@/src/lib/types/types";

interface ReqBody {
	email: string;
	folderStructure: FolderStructureItem[];
}

export async function POST(req: Request): Promise<Response> {
	const data = await req.json();

	if (typeof data !== "object" || data === null || !("folderStructure" in data) || !("email" in data)) {
		return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
	}

	const { folderStructure, email } = data as ReqBody;

	if (typeof email !== "string" || !Array.isArray(folderStructure)) {
		return new Response(JSON.stringify({ error: "Invalid types." }), { status: 400 }); // HTTP status code 400 indicates a bad request
	}

	try {
		const res = await db.users.saveOne.folderStructure.email(email, folderStructure);
		if (!res) return new Response(JSON.stringify({ error: "Could not set the folderStructure." }), { status: 400 });
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error: unknown) {
		const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
		return new Response(JSON.stringify({ error: "Server error, could not set the bind.", details: errorMessage }), {
			status: 500,
		});
	}
}
