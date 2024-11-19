import db from "@/src/lib/db";

interface ReqBody {
	email: string;
	folderId: string;
}

export async function POST(req: Request): Promise<Response> {
	const data = await req.json();

	if (typeof data !== "object" || data === null || !("folderId" in data)) {
		return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
	}

	const { folderId, email } = data as ReqBody;

	if (typeof folderId !== "string" || typeof email !== "string")
		return new Response(JSON.stringify({ error: "Invalid types." }), { status: 400 });

	try {
		const owner = await db.users.getOne.fullObj.folderId(folderId);
		if (!owner || owner.email !== email)
			return new Response(JSON.stringify({ error: "Server error, could not delete folder. 1" }), { status: 500 });
		const res1 = await db.users.deleteOne.folderId.email(email, folderId);
		if (!res1)
			return new Response(JSON.stringify({ error: "Server error, could not delete folder. 2" }), { status: 500 });
		const res2 = await db.folders.deleteOne.folderId(folderId);
		if (!res2)
			return new Response(JSON.stringify({ error: "Server error, could not delete folder. 3" }), { status: 500 });
		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error: unknown) {
		const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
		return new Response(JSON.stringify({ error: "Server error, could not delete folder.", details: errorMessage }), {
			status: 500,
		});
	}
}
