import axios from "axios";
import { riotServerToRiotRegion } from "@/src/lib/utils";
import riotApi from "@/src/lib/riotApi";

const ERROR_MESSAGES = {
	server: "Server error, could not retrieve gameTimeline.",
	riot: "Riot API error, could not retrieve gameTimeline.",
	noServer: "No server provided.",
	wrongServer: "Server provided doesn't exist.",
	noMatchId: "No matchId provided.",
};

const STATUS_CODES = {
	success: 200,
	badRequest: 400,
	serverError: 500,
};

const handleRiotServerError = (newGameTimeline: any) =>
	new Response(JSON.stringify({ error: ERROR_MESSAGES.riot, details: newGameTimeline }), {
		status: STATUS_CODES.serverError,
	});

const handleServerError = (error: unknown) => {
	const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : "Unknown error";
	return new Response(JSON.stringify({ error: ERROR_MESSAGES.server, details: errorMessage }), {
		status: STATUS_CODES.serverError,
	});
};

export async function GET(req: Request): Promise<Response> {
	const { searchParams } = new URL(req.url);
	const matchId = searchParams.get("id");
	const riotServer = searchParams.get("server");

	if (!matchId) {
		return new Response(JSON.stringify({ error: ERROR_MESSAGES.noMatchId }), { status: STATUS_CODES.badRequest });
	}

	if (!riotServer) {
		const error = ERROR_MESSAGES.noServer;
		return new Response(JSON.stringify({ error }), { status: STATUS_CODES.badRequest });
	}

	const riotRegion = riotServerToRiotRegion(riotServer);
	if (!riotRegion)
		return new Response(JSON.stringify({ error: ERROR_MESSAGES.wrongServer }), { status: STATUS_CODES.badRequest });

	try {
		const gameTimeline = await riotApi.matchv5.matchesTimeline(riotRegion, matchId);
		if (gameTimeline === null) {
			const error = ERROR_MESSAGES.server;
			return new Response(JSON.stringify({ error }), { status: STATUS_CODES.serverError });
		}
		return new Response(JSON.stringify(gameTimeline), { status: STATUS_CODES.success });
	} catch (error) {
		if (axios.isAxiosError(error)) {
			return handleRiotServerError(error.response?.status);
		}
		return handleServerError(error);
	}
}
