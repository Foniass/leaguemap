import db from "@/src/lib/db";

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const userEmail = searchParams.get("email");
	if (userEmail) {
		try {
			const userData = await db.users.getOne.fullObj.email(userEmail);
			if (!userData) return new Response(JSON.stringify({ error: "Could not find user." }), { status: 404 });
			return new Response(JSON.stringify(userData), { status: 200 }); // HTTP status code 200 indicates success
		} catch (error: unknown) {
			const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
			return new Response(JSON.stringify({ error: "Server error, could not retrieve user.", details: errorMessage }), {
				status: 500,
			}); // HTTP status code 500 indicates a server error
		}
	} else {
		return new Response(JSON.stringify({ error: "No userEmail provided." }), { status: 400 }); // HTTP status code 400 indicates a bad request
	}
}
