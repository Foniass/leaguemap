import db from "@/src/lib/db";
import { BindKey, isBindKey } from "@/src/lib/types/types";

interface ReqBody {
	email: string;
	bindKey: BindKey;
	bindValue: string | null;
}

export async function POST(req: Request): Promise<Response> {
	const data = await req.json();

	if (
		typeof data !== "object" ||
		data === null ||
		!("email" in data) ||
		!("bindKey" in data) ||
		!("bindValue" in data)
	) {
		return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
	}

	const { email, bindKey, bindValue } = data as ReqBody;

	if (
		typeof email !== "string" ||
		typeof bindKey !== "string" ||
		!isBindKey(bindKey) ||
		(typeof bindValue !== "string" && bindValue !== null)
	) {
		return new Response(JSON.stringify({ error: "Invalid types." }), { status: 400 }); // HTTP status code 400 indicates a bad request
	}

	try {
		const dbUser = await db.users.saveOne.bind.email(email, bindKey, bindValue);
		if (!dbUser) return new Response(JSON.stringify({ error: "Could not set the bind." }), { status: 400 });
		return new Response(JSON.stringify(dbUser), { status: 200 }); // HTTP status code 200 indicates success
	} catch (error: unknown) {
		const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
		return new Response(JSON.stringify({ error: "Server error, could not set the bind.", details: errorMessage }), {
			status: 500,
		});
	}
}
