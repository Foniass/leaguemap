import { fullPathFinding } from "@/src/lib/pathfinding";

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const x1 = searchParams.get("x1");
	const y1 = searchParams.get("y1");
	const x2 = searchParams.get("x2");
	const y2 = searchParams.get("y2");
	if (x1 && y1 && x2 && y2) {
		const result = fullPathFinding(parseInt(x1), parseInt(x2), parseInt(y1), parseInt(y2));

		if ("error" in result) {
			return new Response(JSON.stringify(result), { status: 400 });
		} else {
			return new Response(JSON.stringify(result), { status: 200 });
		}
	} else {
		return new Response(JSON.stringify({ error: "Not all points provided." }), { status: 400 });
	}
}
